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

/** Envelope returned by every paginated list endpoint. */
export interface PageMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface Page<T> {
  data: T[];
  meta: PageMeta;
}

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  quantity: number;
  /** Alert threshold; zero means the alert only fires when the product runs out. */
  minStock: number;
  /** Computed by the API: quantity <= minStock. */
  lowStock: boolean;
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
