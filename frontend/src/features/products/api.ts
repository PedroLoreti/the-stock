import { api } from "@/lib/api/client";
import type { Page, PageParams, Product, StockMovement } from "@/lib/api/types";

export interface ListProductsParams extends PageParams {
  /** Matches name or SKU, case-insensitive. */
  search?: string;
  /** Admin only. */
  includeInactive?: boolean;
}

export interface CreateProductInput {
  name: string;
  description: string;
  sku: string;
  price: number;
  quantity: number;
  minStock: number;
}

export interface UpdateProductInput {
  name?: string;
  description?: string;
  price?: number;
  minStock?: number;
}

export const productsApi = {
  async list(params: ListProductsParams = {}): Promise<Page<Product>> {
    const { data } = await api.get<Page<Product>>("/products", {
      params: {
        page: params.page,
        pageSize: params.pageSize,
        search: params.search?.trim() || undefined,
        includeInactive: params.includeInactive ? true : undefined,
      },
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
