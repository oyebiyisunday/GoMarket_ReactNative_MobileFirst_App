// Simple in-memory demo cart for sample/fallback products when backend data is missing.
export type DemoCartItem = {
  productId: string;
  storeId?: string;
  name: string;
  quantity: number;
  price: number;
};

let demoCart: DemoCartItem[] = [];

export function addDemoItem(item: DemoCartItem) {
  const existing = demoCart.find(
    (i) => i.productId === item.productId && i.storeId === item.storeId
  );
  if (existing) {
    existing.quantity += item.quantity;
  } else {
    demoCart.push({ ...item });
  }
}

// Strict add that prevents mixing stores in the demo cart.
export function addDemoItemStrict(item: DemoCartItem): { ok: boolean; error?: string } {
  if (!item.storeId) {
    return { ok: false, error: "Missing store for cart item." };
  }

  const distinctStores = Array.from(new Set(demoCart.map((i) => i.storeId).filter(Boolean)));
  if (distinctStores.length > 0 && distinctStores[0] !== item.storeId) {
    return {
      ok: false,
      error: "Cart already has items from another store. Please checkout or clear cart first.",
    };
  }

  addDemoItem(item);
  return { ok: true };
}

export function getDemoCart(): DemoCartItem[] {
  return [...demoCart];
}

export function clearDemoCart() {
  demoCart = [];
}
