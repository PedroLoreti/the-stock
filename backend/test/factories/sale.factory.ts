import { randomUUID } from 'node:crypto';
import { Sale, SaleStatus } from '../../src/sale/domain/entities/sale.entity.js';
import { CreateSaleItemProps, SaleItem } from '../../src/sale/domain/entities/sale-item.entity.js';

export function makeSaleItem(overrides: Partial<CreateSaleItemProps> = {}): SaleItem {
    return SaleItem.create({
        productId: randomUUID(),
        quantity: 2,
        unitPrice: 2.5,
        ...overrides,
    });
}

interface MakeSaleOptions {
    items?: SaleItem[];
    createdAt?: Date;
    status?: SaleStatus;
    cancelledAt?: Date | null;
}

/**
 * Monta uma venda já existente (via `restore`), permitindo controlar `createdAt`,
 * o que é essencial para testar a janela de cancelamento.
 */
export function makeSale(options: MakeSaleOptions = {}): Sale {
    return Sale.restore({
        id: randomUUID(),
        status: options.status ?? SaleStatus.COMPLETED,
        items: options.items ?? [makeSaleItem()],
        createdAt: options.createdAt ?? new Date(),
        cancelledAt: options.cancelledAt ?? null,
    });
}
