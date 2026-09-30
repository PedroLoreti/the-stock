import type { StockMovement as StockMovementRow } from '../../../generated/prisma/client.js';
import { StockMovement } from '../../domain/entities/stock-movement.entity.js';

export class StockMovementMapper {
    static toDomain(row: StockMovementRow): StockMovement {
        return StockMovement.restore({
            id: row.id,
            productId: row.productId,
            type: row.type,
            quantity: row.quantity,
            saleId: row.saleId,
            createdAt: row.createdAt,
        });
    }

    static toPersistence(movement: StockMovement) {
        return {
            id: movement.id,
            productId: movement.productId,
            type: movement.type,
            quantity: movement.quantity,
            saleId: movement.saleId,
            createdAt: movement.createdAt,
        };
    }
}
