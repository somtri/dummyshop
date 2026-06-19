import { seededProducts } from "@/db/seed-data";
import type { AuditEvent, CartItem, Order, Product } from "@/lib/types";

type StoreState = {
  products: Product[];
  cartItems: CartItem[];
  orders: Order[];
  auditEvents: AuditEvent[];
};

const globalStore = globalThis as typeof globalThis & { __dummyshop?: StoreState };

function createInitialState(): StoreState {
  return {
    products: seededProducts,
    cartItems: [],
    orders: [],
    auditEvents: []
  };
}

export function getStore() {
  if (!globalStore.__dummyshop) {
    globalStore.__dummyshop = createInitialState();
  }
  return globalStore.__dummyshop;
}

export function resetMutableState() {
  const state = getStore();
  state.cartItems = [];
  state.orders = [];
  state.auditEvents = [];
}

export function logEvent(action: string, entityType: string, entityId?: string) {
  getStore().auditEvents.push({
    id: `evt_${Date.now()}`,
    action,
    entityType,
    entityId,
    createdAt: new Date().toISOString()
  });
}
