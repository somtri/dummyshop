export type Product = {
  id: string;
  name: string;
  description: string;
  category: string;
  diet: string;
  priceCents: number;
  rating: number;
  stock: number;
  tags: string[];
};

export type CartItem = {
  id: string;
  productId: string;
  quantity: number;
};

export type Order = {
  id: string;
  name: string;
  email: string;
  address: string;
  totalCents: number;
  createdAt: string;
};

export type AuditEvent = {
  id: string;
  action: string;
  entityType: string;
  entityId?: string;
  createdAt: string;
};
