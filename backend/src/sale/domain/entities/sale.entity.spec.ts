import { makeSale, makeSaleItem } from '../../../../test/factories/sale.factory.js';
import { InvalidSaleError } from '../errors/invalid-sale.error.js';
import { SaleAlreadyCancelledError } from '../errors/sale-already-cancelled.error.js';
import { SaleCancellationWindowExpiredError } from '../errors/sale-cancellation-window-expired.error.js';
import { Sale, SaleStatus } from './sale.entity.js';

const HOUR = 60 * 60 * 1000;
const NOW = new Date('2026-09-30T12:00:00.000Z');

describe('Sale', () => {
    describe('create', () => {
        it('starts as COMPLETED with the given items', () => {
            const items = [makeSaleItem(), makeSaleItem()];

            const sale = Sale.create(items);

            expect(sale.status).toBe(SaleStatus.COMPLETED);
            expect(sale.items).toHaveLength(2);
            expect(sale.cancelledAt).toBeNull();
            expect(sale.createdAt).toBeInstanceOf(Date);
        });

        it('requires at least one item', () => {
            expect(() => Sale.create([])).toThrow(InvalidSaleError);
        });
    });

    describe('total', () => {
        it('sums the subtotals of all items', () => {
            const sale = Sale.create([
                makeSaleItem({ quantity: 2, unitPrice: 2.5 }), // 5
                makeSaleItem({ quantity: 1, unitPrice: 10 }), // 10
            ]);

            expect(sale.total).toBe(15);
        });

        it('rounds the total to 2 decimal places', () => {
            const sale = Sale.create([
                makeSaleItem({ quantity: 1, unitPrice: 0.1 }),
                makeSaleItem({ quantity: 1, unitPrice: 0.2 }),
            ]);

            expect(sale.total).toBe(0.3);
        });
    });

    describe('cancel', () => {
        it('cancels a sale within the 5 hour window', () => {
            const sale = makeSale({ createdAt: new Date(NOW.getTime() - 2 * HOUR) });

            sale.cancel(NOW);

            expect(sale.status).toBe(SaleStatus.CANCELLED);
            expect(sale.cancelledAt).toEqual(NOW);
        });

        it('still allows cancellation at exactly 5 hours', () => {
            const sale = makeSale({ createdAt: new Date(NOW.getTime() - 5 * HOUR) });

            expect(() => sale.cancel(NOW)).not.toThrow();
        });

        it('rejects cancellation after the 5 hour window', () => {
            const sale = makeSale({ createdAt: new Date(NOW.getTime() - 5 * HOUR - 1) });

            expect(() => sale.cancel(NOW)).toThrow(SaleCancellationWindowExpiredError);
            expect(sale.status).toBe(SaleStatus.COMPLETED);
        });

        it('rejects cancelling twice', () => {
            const sale = makeSale({ createdAt: NOW });
            sale.cancel(NOW);

            expect(() => sale.cancel(NOW)).toThrow(SaleAlreadyCancelledError);
        });
    });
});
