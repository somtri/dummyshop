import { seededProducts } from "@/db/seed-data";
import { getDb, getStorageMode } from "@/lib/db";
import { getStore, logEvent } from "@/lib/store";

type ProductFilters = {
  q?: string | null;
  category?: string | null;
  diet?: string | null;
  maxPrice?: number;
  minRating?: number;
  inStock?: boolean;
  sort?: string | null;
};

function mapProduct(row: Record<string, unknown>) {
  return {
    id: String(row.id),
    name: String(row.name),
    description: String(row.description),
    category: String(row.category),
    diet: String(row.diet),
    priceCents: Number(row.price_cents),
    rating: Number(row.rating),
    stock: Number(row.stock),
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : []
  };
}

async function ensureSeedProducts() {
  const db = getDb();
  const existing = await db.query("select count(*)::int as count from products");
  if (existing.rows[0].count > 0) return;
  for (const product of seededProducts) {
    await db.query(
      `insert into products (id, name, description, category, diet, price_cents, rating, stock, tags)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb)`,
      [
        product.id,
        product.name,
        product.description,
        product.category,
        product.diet,
        product.priceCents,
        product.rating,
        product.stock,
        JSON.stringify(product.tags)
      ]
    );
  }
}

async function ensureCart(sessionId: string) {
  const cartId = `cart_${sessionId}`;
  const db = getDb();
  await db.query(
    `insert into carts (id, benchmark_session_id, created_at, updated_at)
     values ($1, $2, now(), now())
     on conflict (id) do nothing`,
    [cartId, sessionId]
  );
}

export async function listProducts(filters: ProductFilters) {
  if (getStorageMode() === "memory") {
    let products = [...getStore().products];
    if (filters.q) products = products.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(filters.q!.toLowerCase()));
    if (filters.category) products = products.filter((p) => p.category === filters.category);
    if (filters.diet) products = products.filter((p) => p.diet === filters.diet);
    if (filters.maxPrice && filters.maxPrice > 0) products = products.filter((p) => p.priceCents <= filters.maxPrice! * 100);
    if (filters.minRating && filters.minRating > 0) products = products.filter((p) => p.rating >= filters.minRating!);
    if (filters.inStock) products = products.filter((p) => p.stock > 0);
    if (filters.sort === "price-asc") products.sort((a, b) => a.priceCents - b.priceCents);
    if (filters.sort === "price-desc") products.sort((a, b) => b.priceCents - a.priceCents);
    if (filters.sort === "rating-desc") products.sort((a, b) => b.rating - a.rating);
    return products;
  }

  await ensureSeedProducts();
  const clauses: string[] = [];
  const values: unknown[] = [];
  if (filters.q) {
    const needle = filters.q.toLowerCase();
    values.push(needle, needle);
    clauses.push(`(lower(name) like '%' || $${values.length - 1} || '%' or lower(description) like '%' || $${values.length} || '%')`);
  }
  if (filters.category) {
    values.push(filters.category);
    clauses.push(`category = $${values.length}`);
  }
  if (filters.diet) {
    values.push(filters.diet);
    clauses.push(`diet = $${values.length}`);
  }
  if (filters.maxPrice && filters.maxPrice > 0) {
    values.push(Math.round(filters.maxPrice * 100));
    clauses.push(`price_cents <= $${values.length}`);
  }
  if (filters.minRating && filters.minRating > 0) {
    values.push(filters.minRating);
    clauses.push(`rating >= $${values.length}`);
  }
  if (filters.inStock) clauses.push("stock > 0");

  let orderBy = "order by id asc";
  if (filters.sort === "price-asc") orderBy = "order by price_cents asc";
  if (filters.sort === "price-desc") orderBy = "order by price_cents desc";
  if (filters.sort === "rating-desc") orderBy = "order by rating desc";

  const db = getDb();
  const where = clauses.length ? `where ${clauses.join(" and ")}` : "";
  const rows = await db.query(`select * from products ${where} ${orderBy}`, values);
  return rows.rows.map(mapProduct);
}

export async function getProductById(id: string) {
  if (getStorageMode() === "memory") return getStore().products.find((p) => p.id === id) ?? null;
  await ensureSeedProducts();
  const result = await getDb().query("select * from products where id = $1", [id]);
  return result.rows[0] ? mapProduct(result.rows[0]) : null;
}

export async function getCartWithItems(sessionId: string = "default") {
  if (getStorageMode() === "memory") {
    const state = getStore();
    const items = state.cartItems.map((item) => ({ ...item, product: state.products.find((p) => p.id === item.productId) ?? null }));
    const totalCents = items.reduce((sum, item) => sum + (item.product?.priceCents ?? 0) * item.quantity, 0);
    return { items, totalCents };
  }

  const cartId = `cart_${sessionId}`;
  await ensureSeedProducts();
  await ensureCart(sessionId);
  const db = getDb();
  const result = await db.query(
    `select ci.id, ci.product_id, ci.quantity, p.id as p_id, p.name, p.description, p.category, p.diet, p.price_cents, p.rating, p.stock, p.tags
     from cart_items ci
     join products p on p.id = ci.product_id
     where ci.cart_id = $1
     order by ci.created_at asc`,
    [cartId]
  );
  const items = result.rows.map((row) => ({
    id: String(row.id),
    productId: String(row.product_id),
    quantity: Number(row.quantity),
    product: {
      id: String(row.p_id),
      name: String(row.name),
      description: String(row.description),
      category: String(row.category),
      diet: String(row.diet),
      priceCents: Number(row.price_cents),
      rating: Number(row.rating),
      stock: Number(row.stock),
      tags: Array.isArray(row.tags) ? (row.tags as string[]) : []
    }
  }));
  const totalCents = items.reduce((sum, item) => sum + item.product.priceCents * item.quantity, 0);
  return { items, totalCents };
}

export async function addCartItem(productId: string, quantity: number, sessionId: string = "default") {
  if (getStorageMode() === "memory") {
    const state = getStore();
    const product = state.products.find((p) => p.id === productId);
    if (!product) return { error: "not_found" as const };
    if (product.stock < quantity) return { error: "out_of_stock" as const };
    const existing = state.cartItems.find((i) => i.productId === productId);
    if (existing) {
      existing.quantity += quantity;
      logEvent("cart_item_incremented", "cart_item", existing.id);
      return { item: existing };
    }
    const item = { id: `ci_${Date.now()}`, productId, quantity };
    state.cartItems.push(item);
    logEvent("cart_item_added", "cart_item", item.id);
    return { item };
  }

  const cartId = `cart_${sessionId}`;
  await ensureSeedProducts();
  await ensureCart(sessionId);
  const db = getDb();
  const product = await db.query("select id, stock from products where id = $1", [productId]);
  if (!product.rows[0]) return { error: "not_found" as const };
  if (Number(product.rows[0].stock) < quantity) return { error: "out_of_stock" as const };
  const existing = await db.query("select id, quantity from cart_items where cart_id = $1 and product_id = $2", [cartId, productId]);
  if (existing.rows[0]) {
    const updated = await db.query(
      "update cart_items set quantity = quantity + $1, updated_at = now() where id = $2 returning id, product_id, quantity",
      [quantity, existing.rows[0].id]
    );
    await db.query(
      "insert into audit_events (id, action, entity_type, entity_id, created_at) values ($1,$2,$3,$4,now())",
      [`evt_${Date.now()}`, "cart_item_incremented", "cart_item", updated.rows[0].id]
    );
    return { item: { id: updated.rows[0].id as string, productId: updated.rows[0].product_id as string, quantity: Number(updated.rows[0].quantity) } };
  }
  const inserted = await db.query(
    "insert into cart_items (id, cart_id, product_id, quantity, created_at, updated_at) values ($1,$2,$3,$4,now(),now()) returning id, product_id, quantity",
    [`ci_${Date.now()}`, cartId, productId, quantity]
  );
  await db.query(
    "insert into audit_events (id, action, entity_type, entity_id, created_at) values ($1,$2,$3,$4,now())",
    [`evt_${Date.now()}`, "cart_item_added", "cart_item", inserted.rows[0].id]
  );
  return { item: { id: inserted.rows[0].id as string, productId: inserted.rows[0].product_id as string, quantity: Number(inserted.rows[0].quantity) } };
}

export async function updateCartItem(itemId: string, quantity: number) {
  if (getStorageMode() === "memory") {
    const item = getStore().cartItems.find((i) => i.id === itemId);
    if (!item) return null;
    item.quantity = quantity;
    logEvent("cart_item_updated", "cart_item", item.id);
    return item;
  }
  const updated = await getDb().query(
    "update cart_items set quantity = $1, updated_at = now() where id = $2 returning id, product_id, quantity",
    [quantity, itemId]
  );
  if (!updated.rows[0]) return null;
  await getDb().query(
    "insert into audit_events (id, action, entity_type, entity_id, created_at) values ($1,$2,$3,$4,now())",
    [`evt_${Date.now()}`, "cart_item_updated", "cart_item", itemId]
  );
  return { id: String(updated.rows[0].id), productId: String(updated.rows[0].product_id), quantity: Number(updated.rows[0].quantity) };
}

export async function deleteCartItem(itemId: string) {
  if (getStorageMode() === "memory") {
    const state = getStore();
    const index = state.cartItems.findIndex((i) => i.id === itemId);
    if (index < 0) return false;
    const [removed] = state.cartItems.splice(index, 1);
    logEvent("cart_item_removed", "cart_item", removed.id);
    return true;
  }
  const deleted = await getDb().query("delete from cart_items where id = $1 returning id", [itemId]);
  if (!deleted.rows[0]) return false;
  await getDb().query(
    "insert into audit_events (id, action, entity_type, entity_id, created_at) values ($1,$2,$3,$4,now())",
    [`evt_${Date.now()}`, "cart_item_removed", "cart_item", itemId]
  );
  return true;
}

export async function createOrder(payload: { name: string; email: string; address: string }, sessionId: string = "default") {
  if (getStorageMode() === "memory") {
    const state = getStore();
    if (!state.cartItems.length) return { error: "empty_cart" as const };
    const totalCents = state.cartItems.reduce((sum, item) => {
      const product = state.products.find((p) => p.id === item.productId);
      return sum + (product?.priceCents ?? 0) * item.quantity;
    }, 0);
    const order = { id: `ord_${Date.now()}`, ...payload, totalCents, createdAt: new Date().toISOString() };
    state.orders.push(order);
    state.cartItems = [];
    logEvent("order_created", "order", order.id);
    return { order };
  }

  const cartId = `cart_${sessionId}`;
  await ensureCart(sessionId);
  const db = getDb();
  const cart = await getCartWithItems(sessionId);
  if (!cart.items.length) return { error: "empty_cart" as const };
  const orderId = `ord_${Date.now()}`;
  await db.query(
    "insert into orders (id, cart_id, name, email, address, total_cents, status, created_at) values ($1,$2,$3,$4,$5,$6,'submitted',now())",
    [orderId, cartId, payload.name, payload.email, payload.address, cart.totalCents]
  );
  for (const item of cart.items) {
    if (!item.product) {
      continue;
    }
    await db.query(
      "insert into order_items (id, order_id, product_id, quantity, price_cents) values ($1,$2,$3,$4,$5)",
      [`oi_${Date.now()}_${item.id}`, orderId, item.productId, item.quantity, item.product.priceCents]
    );
  }
  await db.query("delete from cart_items where cart_id = $1", [cartId]);
  await db.query(
    "insert into audit_events (id, action, entity_type, entity_id, created_at) values ($1,$2,$3,$4,now())",
    [`evt_${Date.now()}`, "order_created", "order", orderId]
  );
  return { order: { id: orderId, ...payload, totalCents: cart.totalCents, createdAt: new Date().toISOString() } };
}

export async function getOrderById(orderId: string) {
  if (getStorageMode() === "memory") {
    return getStore().orders.find((o) => o.id === orderId) ?? null;
  }
  const result = await getDb().query("select id, name, email, address, total_cents, created_at from orders where id = $1", [orderId]);
  if (!result.rows[0]) return null;
  const row = result.rows[0];
  return {
    id: String(row.id),
    name: String(row.name),
    email: String(row.email),
    address: String(row.address),
    totalCents: Number(row.total_cents),
    createdAt: new Date(row.created_at as string).toISOString()
  };
}

export async function countOrders(sessionId: string = "default") {
  if (getStorageMode() === "memory") return getStore().orders.length;
  const result = await getDb().query(
    "select count(*)::int as count from orders o join carts c on c.id = o.cart_id where c.benchmark_session_id = $1",
    [sessionId]
  );
  return Number(result.rows[0].count);
}

export async function resetShopState(sessionId: string = "default") {
  if (getStorageMode() === "memory") {
    getStore().cartItems = [];
    getStore().orders = [];
    getStore().auditEvents = [];
    return;
  }
  await ensureSeedProducts();
  const db = getDb();
  if (sessionId === "*") {
    await db.query("delete from order_items");
    await db.query("delete from orders");
    await db.query("delete from cart_items");
    await db.query("delete from carts");
    await db.query("delete from audit_events");
  } else {
    const cartId = `cart_${sessionId}`;
    await db.query("delete from order_items where order_id in (select id from orders where cart_id = $1)", [cartId]);
    await db.query("delete from orders where cart_id = $1", [cartId]);
    await db.query("delete from cart_items where cart_id = $1", [cartId]);
    await db.query("delete from carts where id = $1", [cartId]);
  }
}

export async function verifyShop(
  expect: {
    cartQuantity?: number;
    diet?: string;
    category?: string;
    maxPriceEach?: number;
    minRating?: number;
  },
  sessionId: string = "default"
) {
  const checks: Array<{ name: string; passed: boolean; actual: unknown; expected: unknown }> = [];
  const cart = await getCartWithItems(sessionId);
  const cartQuantity = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  if (typeof expect.cartQuantity === "number") {
    checks.push({ name: "cart_quantity", passed: cartQuantity === expect.cartQuantity, actual: cartQuantity, expected: expect.cartQuantity });
  }
  for (const item of cart.items) {
    const product = item.product;
    if (!product) {
      continue;
    }
    if (expect.diet) checks.push({ name: `diet_${product.id}`, passed: product.diet === expect.diet, actual: product.diet, expected: expect.diet });
    if (expect.category) checks.push({ name: `category_${product.id}`, passed: product.category === expect.category, actual: product.category, expected: expect.category });
    if (typeof expect.maxPriceEach === "number") checks.push({ name: `max_price_${product.id}`, passed: product.priceCents <= expect.maxPriceEach * 100, actual: product.priceCents / 100, expected: expect.maxPriceEach });
    if (typeof expect.minRating === "number") checks.push({ name: `min_rating_${product.id}`, passed: product.rating >= expect.minRating, actual: product.rating, expected: expect.minRating });
  }
  return { passed: checks.every((c) => c.passed), checks };
}
