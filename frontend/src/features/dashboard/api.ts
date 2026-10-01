import { api } from "@/lib/api/client";
import type { SaleStatus } from "@/lib/api/types";

export interface SalesSummary {
  revenue: number;
  salesCount: number;
}

export interface LowStockProduct {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  minStock: number;
}

export interface RecentSale {
  id: string;
  userName: string;
  total: number;
  status: SaleStatus;
  itemCount: number;
  createdAt: string;
}

export interface TopProduct {
  productId: string;
  name: string;
  sku: string;
  quantitySold: number;
  revenue: number;
}

export interface Dashboard {
  today: SalesSummary;
  last7Days: SalesSummary & { averageTicket: number };
  stock: {
    activeProducts: number;
    lowStockCount: number;
    /** Null for sellers. */
    inventoryValue: number | null;
  };
  lowStockProducts: LowStockProduct[];
  recentSales: RecentSale[];
  topProducts: TopProduct[];
  todayStart: string;
  generatedAt: string;
}

export const dashboardApi = {
  async get(): Promise<Dashboard> {
    const { data } = await api.get<Dashboard>("/dashboard");
    return data;
  },
};
