import { StockMovement, StockMovementProps } from '../../src/product/domain/entities/stock-movement.entity.js';
import { StockMovementRepository } from '../../src/product/domain/repositories/stock-movement.repository.js';
import { Snapshotable } from './snapshotable.js';

function toProps(movement: StockMovement): StockMovementProps {
    return {
        id: movement.id,
        productId: movement.productId,
        type: movement.type,
        quantity: movement.quantity,
        saleId: movement.saleId,
        createdAt: movement.createdAt,
    };
}

export class InMemoryStockMovementRepository implements StockMovementRepository, Snapshotable {
    private rows: StockMovementProps[] = [];

    async save(movement: StockMovement): Promise<void> {
        this.rows.push(toProps(movement));
    }

    async findByProductId(productId: string): Promise<StockMovement[]> {
        return this.rows
            .filter((row) => row.productId === productId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .map((row) => StockMovement.restore({ ...row }));
    }

    /** Todas as movimentações, na ordem em que foram gravadas. Útil nas asserções. */
    all(): StockMovementProps[] {
        return this.rows.map((row) => ({ ...row }));
    }

    snapshot(): unknown {
        return this.rows.map((row) => ({ ...row }));
    }

    restore(snapshot: unknown): void {
        this.rows = snapshot as StockMovementProps[];
    }
}
