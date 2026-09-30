import { InvalidProductError } from '../errors/invalid-product.error.js';
import { StockMovement, StockMovementType } from './stock-movement.entity.js';

describe('StockMovement', () => {
    it('entry() creates an ENTRY without a sale', () => {
        const movement = StockMovement.entry('product-1', 10);

        expect(movement.type).toBe(StockMovementType.ENTRY);
        expect(movement.productId).toBe('product-1');
        expect(movement.quantity).toBe(10);
        expect(movement.saleId).toBeNull();
        expect(movement.createdAt).toBeInstanceOf(Date);
    });

    it('sale() creates a SALE linked to the sale', () => {
        const movement = StockMovement.sale('product-1', 4, 'sale-1');

        expect(movement.type).toBe(StockMovementType.SALE);
        expect(movement.saleId).toBe('sale-1');
    });

    it('saleCancellation() creates a SALE_CANCELLATION linked to the sale', () => {
        const movement = StockMovement.saleCancellation('product-1', 4, 'sale-1');

        expect(movement.type).toBe(StockMovementType.SALE_CANCELLATION);
        expect(movement.saleId).toBe('sale-1');
    });

    it.each([0, -1])('rejects quantity %d', (quantity) => {
        expect(() => StockMovement.entry('product-1', quantity)).toThrow(InvalidProductError);
    });
});
