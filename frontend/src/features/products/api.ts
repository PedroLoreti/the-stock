import { api } from "@/lib/api/client";
import type { Product, StockMovement } from "@/lib/api/types";

export interface CreateProductInput {
  name: string;
  description: string;
  sku: string;
  price: number;
  quantity: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
}

export const productsApi = {
  async list(includeInactive = false): Promise<Product[]> {
    const { data } = await api.get<Product[]>("/products", {
      params: includeInactive ? { includeInactive: true } : undefined,
    });
    return data;
  },

  async get(id: string): Promise<Product> {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  },

  async create(input: CreateProductInput): Promise<Product> {
    const { data } = await api.post<Product>("/products", input);
    return data;
  },

  async update(id: string, input: UpdateProductInput): Promise<Product> {
    const { data } = await api.patch<Product>(`/products/${id}`, input);
    return data;
  },

  async deactivate(id: string): Promise<Product> {
    const { data } = await api.delete<Product>(`/products/${id}`);
    return data;
  },

  async restore(id: string): Promise<Product> {
    const { data } = await api.post<Product>(`/products/${id}/restore`);
    return data;
  },

  async registerEntry(id: string, quantity: number): Promise<Product> {
    const { data } = await api.post<Product>(`/products/${id}/entries`, { quantity });
    return data;
  },

  async movements(id: string): Promise<StockMovement[]> {
    const { data } = await api.get<StockMovement[]>(`/products/${id}/movements`);
    return data;
  },
};
