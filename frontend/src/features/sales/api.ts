import { api } from "@/lib/api/client";
import type { Sale } from "@/lib/api/types";

export interface CreateSaleItemInput {
  productId: string;
  quantity: number;
}

export interface CreateSaleInput {
  items: CreateSaleItemInput[];
}

export const salesApi = {
  async list(): Promise<Sale[]> {
    const { data } = await api.get<Sale[]>("/sales");
    return data;
  },

  async get(id: string): Promise<Sale> {
    const { data } = await api.get<Sale>(`/sales/${id}`);
    return data;
  },

  async create(input: CreateSaleInput): Promise<Sale> {
    const { data } = await api.post<Sale>("/sales", input);
    return data;
  },

  async cancel(id: string): Promise<Sale> {
    const { data } = await api.post<Sale>(`/sales/${id}/cancel`);
    return data;
  },
};
