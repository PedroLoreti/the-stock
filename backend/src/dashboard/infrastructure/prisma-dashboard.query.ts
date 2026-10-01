import { Injectable } from '@nestjs/common';
import { roundMoney } from '../../shared/domain/money.js';
import { PrismaService } from '../../shared/infrastructure/prisma/prisma.service.js';
import {
    LowStockProduct,
    RecentSale,
    SalesSummary,
    StockSummary,
    TopProduct,
} from '../application/dashboard.read-model.js';
import { DashboardQuery } from '../application/ports/dashboard-query.js';

interface StockSummaryRow {
    activeProducts: number;
    inventoryValue: number;
    lowStockCount: number;
}

@Injectable()
export class PrismaDashboardQuery implements DashboardQuery {
    constructor(private readonly prisma: PrismaService) {}

    async salesSummary(since: Date): Promise<SalesSummary> {
        const result = await this.prisma.db.sale.aggregate({
            where: { status: 'COMPLETED', createdAt: { gte: since } },
            _sum: { total: true },
            _count: { _all: true },
        });
        return { revenue: roundMoney(result._sum.total?.toNumber() ?? 0), salesCount: result._count._all };
    }

    /** SQL direto: o Prisma não compara duas colunas (`quantity <= min_stock`) nem multiplica em agregações. */
    async stockSummary(): Promise<StockSummary> {
        const [row] = await this.prisma.db.$queryRaw<StockSummaryRow[]>`
            SELECT COUNT(*)::int                                            AS "activeProducts",
                   COALESCE(SUM(price * quantity), 0)::float8               AS "inventoryValue",
                   COUNT(*) FILTER (WHERE quantity <= min_stock)::int       AS "lowStockCount"
            FROM products
            WHERE active = true`;
        return {
            activeProducts: row.activeProducts,
            inventoryValue: roundMoney(row.inventoryValue),
            lowStockCount: row.lowStockCount,
        };
    }

    lowStockProducts(limit: number): Promise<LowStockProduct[]> {
        return this.prisma.db.$queryRaw<LowStockProduct[]>`
            SELECT id, name, sku, quantity, min_stock AS "minStock"
            FROM products
            WHERE active = true AND quantity <= min_stock
            ORDER BY quantity ASC, name ASC
            LIMIT ${limit}`;
    }

    async recentSales(limit: number): Promise<RecentSale[]> {
        const rows = await this.prisma.db.sale.findMany({
            take: limit,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } }, items: { select: { quantity: true } } },
        });
        return rows.map((row) => ({
            id: row.id,
            userName: row.user.name,
            total: row.total.toNumber(),
            status: row.status,
            itemCount: row.items.reduce((sum, item) => sum + item.quantity, 0),
            createdAt: row.createdAt,
        }));
    }

    async topProducts(since: Date, limit: number): Promise<TopProduct[]> {
        const groups = await this.prisma.db.saleItem.groupBy({
            by: ['productId'],
            where: { sale: { status: 'COMPLETED', createdAt: { gte: since } } },
            _sum: { quantity: true, subtotal: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: limit,
        });
        if (groups.length === 0) {
            return [];
        }

        const products = await this.prisma.db.product.findMany({
            where: { id: { in: groups.map((group) => group.productId) } },
            select: { id: true, name: true, sku: true },
        });
        const productById = new Map(products.map((product) => [product.id, product]));

        return groups.map((group) => {
            const product = productById.get(group.productId);
            return {
                productId: group.productId,
                name: product?.name ?? 'Unknown product',
                sku: product?.sku ?? '',
                quantitySold: group._sum.quantity ?? 0,
                revenue: roundMoney(group._sum.subtotal?.toNumber() ?? 0),
            };
        });
    }
}
