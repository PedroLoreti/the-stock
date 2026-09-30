import { makeSaleItem } from '../../../../test/factories/sale.factory.js';
import { InvalidSaleError } from '../errors/invalid-sale.error.js';

describe('SaleItem', () => {
    it('computes the subtotal from quantity and unit price', () => {
        expect(makeSaleItem({ quantity: 4, unitPrice: 2.5 }).subtotal).toBe(10);
    });

    it('rounds the subtotal to 2 decimal places (no floating point noise)', () => {
        // 3 * 0.1 = 0.30000000000000004 em JavaScript
        expect(makeSaleItem({ quantity: 3, unitPrice: 0.1 }).subtotal).toBe(0.3);
    });

    it.each([0, -1])('rejects quantity %d', (quantity) => {
        expect(() => makeSaleItem({ quantity })).toThrow(InvalidSaleError);
    });

    it('rejects a negative unit price', () => {
        expect(() => makeSaleItem({ unitPrice: -1 })).toThrow(InvalidSaleError);
    });
});
