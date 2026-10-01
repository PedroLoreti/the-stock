import type { Prisma } from '../../../generated/prisma/client.js';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleItem } from '../../domain/entities/sale-item.entity.js';

/** Toda leitura de venda traz os itens com nome/SKU do produto e o nome do vendedor (joins). */
export const SALE_INCLUDE = {
    items: { include: { product: { select: { name: true, sku: true } } } },
    user: { select: { name: true } },
} satisfies Prisma.SaleInclude;

export type SaleRow = Prisma.SaleGetPayload<{ include: typeof SALE_INCLUDE }>;

export class SaleMapper {
    static toDomain(row: SaleRow): Sale {
        return Sale.restore({
            id: row.id,
            userId: row.userId,
            userName: row.user.name,
            status: row.status,
            items: row.items.map((item) =>
                SaleItem.restore({
                    id: item.id,
                    productId: item.productId,
                    productName: item.product.name,
                    productSku: item.product.sku,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice.toNumber(),
                }),
            ),
            createdAt: row.createdAt,
            cancelledAt: row.cancelledAt,
        });
    }

    static toPersistence(sale: Sale) {
        return {
            id: sale.id,
            userId: sale.userId,
            status: sale.status,
            total: sale.total,
            createdAt: sale.createdAt,
            cancelledAt: sale.cancelledAt,
            items: sale.items.map((item) => ({
                id: item.id,
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                subtotal: item.subtotal,
            })),
        };
    }
}
