import { makeProduct } from '../../../../test/factories/product.factory.js';
import { InsufficientStockError } from '../errors/insufficient-stock.error.js';
import { InvalidProductError } from '../errors/invalid-product.error.js';
import { ProductInactiveError } from '../errors/product-inactive.error.js';
import { Product } from './product.entity.js';

describe('Product', () => {
    describe('create', () => {
        it('creates an active product with a generated id and version 0', () => {
            const product = makeProduct({ sku: 'TS-1', quantity: 10 });

            expect(product.id).toMatch(/^[0-9a-f-]{36}$/);
            expect(product.active).toBe(true);
            expect(product.version).toBe(0);
            expect(product.quantity).toBe(10);
        });

        it('trims the sku', () => {
            expect(makeProduct({ sku: '  TS-7  ' }).sku).toBe('TS-7');
        });

        it('allows an initial quantity of zero', () => {
            expect(makeProduct({ quantity: 0 }).quantity).toBe(0);
        });

        it.each(['', '   '])('rejects an empty name (%j)', (name) => {
            expect(() => makeProduct({ name })).toThrow(InvalidProductError);
        });

        it.each(['ts-1', 'TS1', 'TS-', 'AB-1', 'TS-1a', ''])('rejects sku %j (must be TS-<number>)', (sku) => {
            expect(() => makeProduct({ sku })).toThrow(InvalidProductError);
        });

        it.each([0, -1])('rejects price %d (must be greater than zero)', (price) => {
            expect(() => makeProduct({ price })).toThrow(InvalidProductError);
        });

        it('rejects a negative quantity', () => {
            expect(() => makeProduct({ quantity: -1 })).toThrow(InvalidProductError);
        });

        it('defaults the minimum stock to zero', () => {
            expect(makeProduct().minStock).toBe(0);
        });

        it.each([-1, 1.5])('rejects minimum stock %d (must be a non-negative integer)', (minStock) => {
            expect(() => makeProduct({ minStock })).toThrow(InvalidProductError);
        });
    });

    describe('isLowStock', () => {
        it('is true when the quantity reaches the minimum stock or runs out', () => {
            expect(makeProduct({ quantity: 10, minStock: 5 }).isLowStock).toBe(false);
            expect(makeProduct({ quantity: 5, minStock: 5 }).isLowStock).toBe(true);
            expect(makeProduct({ quantity: 3, minStock: 5 }).isLowStock).toBe(true);
            expect(makeProduct({ quantity: 0, minStock: 0 }).isLowStock).toBe(true);
            expect(makeProduct({ quantity: 1, minStock: 0 }).isLowStock).toBe(false);
        });

        it('can be changed through update', () => {
            const product = makeProduct({ quantity: 4, minStock: 0 });
            product.update({ minStock: 4 });
            expect(product.minStock).toBe(4);
            expect(product.isLowStock).toBe(true);
            expect(() => product.update({ minStock: -1 })).toThrow(InvalidProductError);
        });
    });

    describe('restore', () => {
        it('rebuilds the product without generating a new id or validating', () => {
            const product = Product.restore({
                id: 'fixed-id',
                name: 'Lápis',
                description: '',
                sku: 'TS-9',
                price: 1,
                quantity: 0,
                minStock: 0,
                active: false,
                version: 3,
            });

            expect(product.id).toBe('fixed-id');
            expect(product.active).toBe(false);
            expect(product.version).toBe(3);
        });
    });

    describe('update', () => {
        it('changes only the fields that were provided', () => {
            const product = makeProduct({ name: 'Caneta', description: 'Azul', price: 2 });

            product.update({ price: 3 });

            expect(product.name).toBe('Caneta');
            expect(product.description).toBe('Azul');
            expect(product.price).toBe(3);
        });

        it('rejects an empty name', () => {
            const product = makeProduct();
            expect(() => product.update({ name: ' ' })).toThrow(InvalidProductError);
        });

        it('rejects a non-positive price and keeps the previous one', () => {
            const product = makeProduct({ price: 2 });
            expect(() => product.update({ price: 0 })).toThrow(InvalidProductError);
            expect(product.price).toBe(2);
        });
    });

    describe('addQuantity', () => {
        it('increases the quantity', () => {
            const product = makeProduct({ quantity: 10 });
            product.addQuantity(5);
            expect(product.quantity).toBe(15);
        });

        it.each([0, -3])('rejects amount %d', (amount) => {
            const product = makeProduct();
            expect(() => product.addQuantity(amount)).toThrow(InvalidProductError);
        });

        it('rejects entries on an inactive product', () => {
            const product = makeProduct();
            product.deactivate();
            expect(() => product.addQuantity(1)).toThrow(ProductInactiveError);
        });
    });

    describe('removeQuantity', () => {
        it('decreases the quantity', () => {
            const product = makeProduct({ quantity: 10 });
            product.removeQuantity(4);
            expect(product.quantity).toBe(6);
        });

        it('allows the quantity to reach exactly zero', () => {
            const product = makeProduct({ quantity: 5 });
            product.removeQuantity(5);
            expect(product.quantity).toBe(0);
        });

        it('never lets the quantity go negative', () => {
            const product = makeProduct({ quantity: 5 });
            expect(() => product.removeQuantity(6)).toThrow(InsufficientStockError);
            expect(product.quantity).toBe(5);
        });

        it.each([0, -1])('rejects amount %d', (amount) => {
            const product = makeProduct();
            expect(() => product.removeQuantity(amount)).toThrow(InvalidProductError);
        });

        it('rejects removals on an inactive product', () => {
            const product = makeProduct();
            product.deactivate();
            expect(() => product.removeQuantity(1)).toThrow(ProductInactiveError);
        });
    });

    describe('deactivate', () => {
        it('marks the product as inactive', () => {
            const product = makeProduct();
            product.deactivate();
            expect(product.active).toBe(false);
        });
    });
});
