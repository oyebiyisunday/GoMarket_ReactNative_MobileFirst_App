import { API_BASE } from "../lib/config";

const BASE = `${API_BASE}/catalog`;

export async function fetchStoreProducts(token: string, limit = 6) {
  const res = await fetch(`${BASE}/products?limit=${limit}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to load store products");
  const data = await res.json();
  return Array.isArray(data) ? data : (data as any)?.products ?? (data as any)?.items ?? [];
}
