import { randomUUID } from 'node:crypto';
import { InvalidProductError } from '../errors/invalid-product.error.js';

export const StockMovementType = {
    ENTRY: 'ENTRY',
    SALE: 'SALE',
    SALE_CANCELLATION: 'SALE_CANCELLATION',
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export interface StockMovementProps {
    id: string;
    productId: string;
    type: StockMovementType;
    quantity: number;
    saleId: string | null;
    createdAt: Date;
}

export class StockMovement {
    private constructor(private props: StockMovementProps) {}

    static entry(productId: string, quantity: number): StockMovement {
        return StockMovement.create(productId, StockMovementType.ENTRY, quantity, null);
    }

    static sale(productId: string, quantity: number, saleId: string): StockMovement {
        return StockMovement.create(productId, StockMovementType.SALE, quantity, saleId);
    }

    static saleCancellation(productId: string, quantity: number, saleId: string): StockMovement {
        return StockMovement.create(productId, StockMovementType.SALE_CANCELLATION, quantity, saleId);
    }

    static restore(props: StockMovementProps): StockMovement {
        return new StockMovement(props);
    }

    private static create(
        productId: string,
        type: StockMovementType,
        quantity: number,
        saleId: string | null,
    ): StockMovement {
        if (quantity <= 0) {
            throw new InvalidProductError('Movement quantity must be greater than zero');
        }
        return new StockMovement({
            id: randomUUID(),
            productId,
            type,
            quantity,
            saleId,
            createdAt: new Date(),
        });
    }

    get id() {
        return this.props.id;
    }
    get productId() {
        return this.props.productId;
    }
    get type() {
        return this.props.type;
    }
    get quantity() {
        return this.props.quantity;
    }
    get saleId() {
        return this.props.saleId;
    }
    get createdAt() {
        return this.props.createdAt;
    }
}
