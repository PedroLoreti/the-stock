import { Sale, SaleStatus } from '../../src/sale/domain/entities/sale.entity.js';
import { SaleItem, SaleItemProps } from '../../src/sale/domain/entities/sale-item.entity.js';
import { SaleRepository } from '../../src/sale/domain/repositories/sale.repository.js';
import { Page, PageRequest, paginateArray } from '../../src/shared/application/pagination.js';
import { Snapshotable } from './snapshotable.js';

interface SaleRow {
    id: string;
    userId: string;
    userName: string;
    status: SaleStatus;
    items: SaleItemProps[];
    createdAt: Date;
    cancelledAt: Date | null;
}

function toRow(sale: Sale): SaleRow {
    return {
        id: sale.id,
        userId: sale.userId,
        userName: sale.userName,
        status: sale.status,
        items: sale.items.map((item) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            productSku: item.productSku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        })),
        createdAt: sale.createdAt,
        cancelledAt: sale.cancelledAt,
    };
}

function toDomain(row: SaleRow): Sale {
    return Sale.restore({
        id: row.id,
        userId: row.userId,
        userName: row.userName,
        status: row.status,
        items: row.items.map((item) => SaleItem.restore({ ...item })),
        createdAt: row.createdAt,
        cancelledAt: row.cancelledAt,
    });
}

export class InMemorySaleRepository implements SaleRepository, Snapshotable {
    private rows = new Map<string, SaleRow>();

    async save(sale: Sale): Promise<void> {
        this.rows.set(sale.id, toRow(sale));
    }

    async findById(id: string): Promise<Sale | null> {
        const row = this.rows.get(id);
        return row ? toDomain(row) : null;
    }

    async findAll(request: PageRequest): Promise<Page<Sale>> {
        const sorted = [...this.rows.values()]
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map(toDomain);
        return paginateArray(sorted, request);
    }

    count(): number {
        return this.rows.size;
    }

    snapshot(): unknown {
        return new Map([...this.rows].map(([id, row]) => [id, { ...row, items: row.items.map((i) => ({ ...i })) }]));
    }

    restore(snapshot: unknown): void {
        this.rows = snapshot as Map<string, SaleRow>;
    }
}
