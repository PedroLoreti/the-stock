import { Injectable } from '@nestjs/common';
import { roundMoney } from '../../../shared/domain/money.js';
import { UserRole } from '../../../user/domain/entities/user.entity.js';
import { Dashboard } from '../dashboard.read-model.js';
import { DashboardQuery } from '../ports/dashboard-query.js';

export interface GetDashboardInput {
    requesterRole: UserRole;
    /** Injetável nos testes; por padrão, agora. */
    now?: Date;
}

const LOW_STOCK_LIMIT = 5;
const RECENT_SALES_LIMIT = 5;
const TOP_PRODUCTS_LIMIT = 5;
/** "Últimos 7 dias" = hoje e os 6 dias anteriores, a partir da meia-noite. */
const TRAILING_DAYS = 7;

@Injectable()
export class GetDashboardUseCase {
    constructor(private readonly query: DashboardQuery) {}

    async execute(input: GetDashboardInput): Promise<Dashboard> {
        const now = input.now ?? new Date();
        const todayStart = startOfDay(now);
        const weekStart = new Date(todayStart);
        weekStart.setDate(weekStart.getDate() - (TRAILING_DAYS - 1));

        const [today, week, stock, lowStockProducts, recentSales, topProducts] = await Promise.all([
            this.query.salesSummary(todayStart),
            this.query.salesSummary(weekStart),
            this.query.stockSummary(),
            this.query.lowStockProducts(LOW_STOCK_LIMIT),
            this.query.recentSales(RECENT_SALES_LIMIT),
            this.query.topProducts(weekStart, TOP_PRODUCTS_LIMIT),
        ]);

        const canSeeInventoryValue = input.requesterRole !== UserRole.SELLER;

        return {
            today,
            last7Days: {
                ...week,
                averageTicket: week.salesCount > 0 ? roundMoney(week.revenue / week.salesCount) : 0,
            },
            stock: {
                activeProducts: stock.activeProducts,
                lowStockCount: stock.lowStockCount,
                inventoryValue: canSeeInventoryValue ? stock.inventoryValue : null,
            },
            lowStockProducts,
            recentSales,
            topProducts,
            todayStart,
            generatedAt: now,
        };
    }
}

function startOfDay(date: Date): Date {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start;
}
