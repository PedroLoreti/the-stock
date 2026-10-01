import type { Prisma } from '../../../generated/prisma/client.js';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleItem } from '../../domain/entities/sale-item.entity.js';

export type SaleRow = Prisma.SaleGetPayload<{ include: { items: true } }>;

export class SaleMapper {
    static toDomain(row: SaleRow): Sale {
        return Sale.restore({
            id: row.id,
            userId: row.userId,
            status: row.status,
            items: row.items.map((item) =>
                SaleItem.restore({
                    id: item.id,
                    productId: item.productId,
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
