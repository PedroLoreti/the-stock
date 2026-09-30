import { StockMovement, StockMovementType } from '../../domain/entities/stock-movement.entity.js';

export class StockMovementResponseDto {
    constructor(
        readonly id: string,
        readonly productId: string,
        readonly type: StockMovementType,
        readonly quantity: number,
        readonly saleId: string | null,
        readonly createdAt: Date,
    ) {}

    static fromEntity(movement: StockMovement): StockMovementResponseDto {
        return new StockMovementResponseDto(
            movement.id,
            movement.productId,
            movement.type,
            movement.quantity,
            movement.saleId,
            movement.createdAt,
        );
    }
}
