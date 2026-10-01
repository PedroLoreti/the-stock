import { Sale, SaleStatus } from '../../domain/entities/sale.entity.js';
import { SaleItem } from '../../domain/entities/sale-item.entity.js';

export class SaleItemResponseDto {
    constructor(
        readonly id: string,
        readonly productId: string,
        readonly quantity: number,
        readonly unitPrice: number,
        readonly subtotal: number,
    ) {}

    static fromEntity(item: SaleItem): SaleItemResponseDto {
        return new SaleItemResponseDto(item.id, item.productId, item.quantity, item.unitPrice, item.subtotal);
    }
}

export class SaleResponseDto {
    constructor(
        readonly id: string,
        readonly userId: string,
        readonly status: SaleStatus,
        readonly total: number,
        readonly items: SaleItemResponseDto[],
        readonly createdAt: Date,
        readonly cancelledAt: Date | null,
    ) {}

    static fromEntity(sale: Sale): SaleResponseDto {
        return new SaleResponseDto(
            sale.id,
            sale.userId,
            sale.status,
            sale.total,
            sale.items.map(SaleItemResponseDto.fromEntity),
            sale.createdAt,
            sale.cancelledAt,
        );
    }
}
