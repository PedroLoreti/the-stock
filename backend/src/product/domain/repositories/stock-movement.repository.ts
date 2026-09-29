import { StockMovement } from '../entities/stock-movement.entity.js';

export abstract class StockMovementRepository {
    abstract save(movement: StockMovement): Promise<void>;
    abstract findByProductId(productId: string): Promise<StockMovement[]>;
}
