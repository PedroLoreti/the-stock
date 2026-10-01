import { SaleStatus } from '../../sale/domain/entities/sale.entity.js';

/**
 * Modelo de leitura do dashboard. Não há entidade: são agregações calculadas
 * pelo banco a partir de produtos e vendas.
 */
export interface SalesSummary {
    /** Soma do total das vendas concluídas no período. */
    revenue: number;
    salesCount: number;
}

export interface StockSummary {
    activeProducts: number;
    /** Soma de preço × quantidade dos produtos ativos. */
    inventoryValue: number;
    /** Produtos ativos com quantity <= minStock (inclui esgotados). */
    lowStockCount: number;
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
    createdAt: Date;
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
    stock: Omit<StockSummary, 'inventoryValue'> & {
        /** Nulo para vendedores: valor do estoque é informação de gestão. */
        inventoryValue: number | null;
    };
    lowStockProducts: LowStockProduct[];
    recentSales: RecentSale[];
    topProducts: TopProduct[];
    /** Início do "hoje" usado nos cálculos (fuso do servidor). */
    todayStart: Date;
    generatedAt: Date;
}
