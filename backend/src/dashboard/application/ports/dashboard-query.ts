import { LowStockProduct, RecentSale, SalesSummary, StockSummary, TopProduct } from '../dashboard.read-model.js';

/** Consultas agregadas do dashboard; a implementação fica na infraestrutura (SQL). */
export abstract class DashboardQuery {
    /** Vendas concluídas (COMPLETED) criadas a partir de `since`. */
    abstract salesSummary(since: Date): Promise<SalesSummary>;
    abstract stockSummary(): Promise<StockSummary>;
    /** Produtos ativos em estoque baixo, dos mais críticos (menor saldo) para os demais. */
    abstract lowStockProducts(limit: number): Promise<LowStockProduct[]>;
    /** Vendas mais recentes, de qualquer status. */
    abstract recentSales(limit: number): Promise<RecentSale[]>;
    /** Produtos mais vendidos (quantidade) em vendas concluídas a partir de `since`. */
    abstract topProducts(since: Date, limit: number): Promise<TopProduct[]>;
}
