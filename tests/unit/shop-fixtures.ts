import { seededProducts } from "@/db/seed-data";
import { getStore, resetMutableState } from "@/lib/store";
import type { CartItem } from "@/lib/types";

export const SHOP_001_PRODUCT_ID = "prod_031";
export const SHOP_001_NON_QUALIFYING_ID = "prod_001";

export function resetShopUnitTestState() {
  const state = getStore();
  state.products = [...seededProducts];
  resetMutableState();
}

export function setCartItems(items: CartItem[]) {
  getStore().cartItems = items;
}

export function validShop001Cart(itemId = "ci_1"): CartItem[] {
  return [{ id: itemId, productId: SHOP_001_PRODUCT_ID, quantity: 2 }];
}

export function shop001QualifyingProduct() {
  const product = getStore().products.find((p) => p.id === SHOP_001_PRODUCT_ID);
  if (!product) {
    throw new Error(`missing canonical product ${SHOP_001_PRODUCT_ID}`);
  }
  return product;
}
