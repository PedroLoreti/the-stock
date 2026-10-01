import { UserRole } from '../../../user/domain/entities/user.entity.js';
import { LowStockProduct, RecentSale, SalesSummary, StockSummary, TopProduct } from '../dashboard.read-model.js';
import { DashboardQuery } from '../ports/dashboard-query.js';
import { GetDashboardUseCase } from './get-dashboard.use-case.js';

class FakeDashboardQuery implements DashboardQuery {
    salesSummaryCalls: Date[] = [];
    topProductsSince: Date | null = null;
    limits: Record<string, number> = {};

    constructor(private readonly summaries: Record<string, SalesSummary> = {}) {}

    async salesSummary(since: Date): Promise<SalesSummary> {
        this.salesSummaryCalls.push(since);
        return this.summaries[since.toISOString()] ?? { revenue: 0, salesCount: 0 };
    }
    async stockSummary(): Promise<StockSummary> {
        return { activeProducts: 12, inventoryValue: 1234.56, lowStockCount: 3 };
    }
    async lowStockProducts(limit: number): Promise<LowStockProduct[]> {
        this.limits.lowStock = limit;
        return [];
    }
    async recentSales(limit: number): Promise<RecentSale[]> {
        this.limits.recentSales = limit;
        return [];
    }
    async topProducts(since: Date, limit: number): Promise<TopProduct[]> {
        this.topProductsSince = since;
        this.limits.topProducts = limit;
        return [];
    }
}

describe('GetDashboardUseCase', () => {
    // 15 de setembro, 14:30 no fuso local.
    const now = new Date(2026, 8, 15, 14, 30);
    const todayStart = new Date(2026, 8, 15, 0, 0, 0, 0);
    const weekStart = new Date(2026, 8, 9, 0, 0, 0, 0);

    it('queries today from local midnight and the last 7 days including today', async () => {
        const query = new FakeDashboardQuery();

        const result = await new GetDashboardUseCase(query).execute({ requesterRole: UserRole.ADMIN, now });

        expect(query.salesSummaryCalls).toEqual([todayStart, weekStart]);
        expect(query.topProductsSince).toEqual(weekStart);
        expect(result.todayStart).toEqual(todayStart);
        expect(result.generatedAt).toEqual(now);
        expect(query.limits).toEqual({ lowStock: 5, recentSales: 5, topProducts: 5 });
    });

    it('computes the average ticket of the week, rounded to cents', async () => {
        const query = new FakeDashboardQuery({
            [todayStart.toISOString()]: { revenue: 100, salesCount: 1 },
            [weekStart.toISOString()]: { revenue: 1000, salesCount: 3 },
        });

        const result = await new GetDashboardUseCase(query).execute({ requesterRole: UserRole.MANAGEMENT, now });

        expect(result.today).toEqual({ revenue: 100, salesCount: 1 });
        expect(result.last7Days).toEqual({ revenue: 1000, salesCount: 3, averageTicket: 333.33 });
    });

    it('returns an average ticket of zero when there were no sales', async () => {
        const result = await new GetDashboardUseCase(new FakeDashboardQuery()).execute({
            requesterRole: UserRole.ADMIN,
            now,
        });

        expect(result.last7Days.averageTicket).toBe(0);
    });

    it('hides the inventory value from sellers but keeps the counters', async () => {
        const useCase = new GetDashboardUseCase(new FakeDashboardQuery());

        const forSeller = await useCase.execute({ requesterRole: UserRole.SELLER, now });
        const forManagement = await useCase.execute({ requesterRole: UserRole.MANAGEMENT, now });

        expect(forSeller.stock).toEqual({ activeProducts: 12, lowStockCount: 3, inventoryValue: null });
        expect(forManagement.stock).toEqual({ activeProducts: 12, lowStockCount: 3, inventoryValue: 1234.56 });
    });
});
