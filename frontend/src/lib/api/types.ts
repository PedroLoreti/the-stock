export type UserRole = "ADMIN" | "MANAGEMENT" | "SELLER";

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: UserRole;
  active: boolean;
  mustChangePassword: boolean;
}

export interface AuthResponse {
  accessToken: string;
  mustChangePassword: boolean;
  user: User;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  quantity: number;
  active: boolean;
}

export type StockMovementType = "ENTRY" | "SALE" | "SALE_CANCELLATION";

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  quantity: number;
  saleId: string | null;
  createdAt: string;
}

export type SaleStatus = "COMPLETED" | "CANCELLED";

export interface SaleItem {
  id: string;
  productId: string;
  productName: string;
  productSku: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  userId: string;
  userName: string;
  status: SaleStatus;
  total: number;
  items: SaleItem[];
  createdAt: string;
  cancelledAt: string | null;
}
