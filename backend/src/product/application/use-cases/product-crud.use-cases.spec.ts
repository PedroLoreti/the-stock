import { InMemoryProductRepository } from '../../../../test/fakes/in-memory-product.repository.js';
import { InMemoryStockMovementRepository } from '../../../../test/fakes/in-memory-stock-movement.repository.js';
import { makeProduct } from '../../../../test/factories/product.factory.js';
import { StockMovement } from '../../domain/entities/stock-movement.entity.js';
import { InvalidProductError } from '../../domain/errors/invalid-product.error.js';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error.js';
import { DeactivateProductUseCase } from './deactivate-product.use-case.js';
import { GetProductUseCase } from './get-product.use-case.js';
import { ListProductsUseCase } from './list-products.use-case.js';
import { ListStockMovementsUseCase } from './list-stock-movements.use-case.js';
import { UpdateProductUseCase } from './update-product.use-case.js';

describe('Product read/update use cases', () => {
    let products: InMemoryProductRepository;
    let movements: InMemoryStockMovementRepository;

    beforeEach(() => {
        products = new InMemoryProductRepository();
        movements = new InMemoryStockMovementRepository();
    });

    describe('GetProductUseCase', () => {
        it('returns the product', async () => {
            const product = makeProduct();
            await products.save(product);

            const result = await new GetProductUseCase(products).execute({ id: product.id });

            expect(result.id).toBe(product.id);
        });

        it('throws when the product does not exist', async () => {
            await expect(new GetProductUseCase(products).execute({ id: 'missing' })).rejects.toBeInstanceOf(
                ProductNotFoundError,
            );
        });
    });

    describe('ListProductsUseCase', () => {
        it('returns every product', async () => {
            await products.save(makeProduct());
            await products.save(makeProduct());

            expect(await new ListProductsUseCase(products).execute()).toHaveLength(2);
        });
    });

    describe('UpdateProductUseCase', () => {
        it('updates only the provided fields and persists', async () => {
            const product = makeProduct({ name: 'Caneta', price: 2 });
            await products.save(product);

            const result = await new UpdateProductUseCase(products).execute({ id: product.id, price: 3 });

            expect(result.name).toBe('Caneta');
            expect(result.price).toBe(3);
            expect((await products.findById(product.id))!.price).toBe(3);
        });

        it('rejects invalid data without persisting', async () => {
            const product = makeProduct({ price: 2 });
            await products.save(product);

            await expect(
                new UpdateProductUseCase(products).execute({ id: product.id, price: -1 }),
            ).rejects.toBeInstanceOf(InvalidProductError);
            expect((await products.findById(product.id))!.price).toBe(2);
        });

        it('throws when the product does not exist', async () => {
            await expect(
                new UpdateProductUseCase(products).execute({ id: 'missing', name: 'x' }),
            ).rejects.toBeInstanceOf(ProductNotFoundError);
        });
    });

    describe('DeactivateProductUseCase', () => {
        it('marks the product as inactive and persists', async () => {
            const product = makeProduct();
            await products.save(product);

            const result = await new DeactivateProductUseCase(products).execute({ id: product.id });

            expect(result.active).toBe(false);
            expect((await products.findById(product.id))!.active).toBe(false);
        });

        it('throws when the product does not exist', async () => {
            await expect(new DeactivateProductUseCase(products).execute({ id: 'missing' })).rejects.toBeInstanceOf(
                ProductNotFoundError,
            );
        });
    });

    describe('ListStockMovementsUseCase', () => {
        it('returns only the movements of the given product', async () => {
            const product = makeProduct();
            const other = makeProduct();
            await products.save(product);
            await products.save(other);
            await movements.save(StockMovement.entry(product.id, 5));
            await movements.save(StockMovement.entry(other.id, 7));

            const result = await new ListStockMovementsUseCase(products, movements).execute({
                productId: product.id,
            });

            expect(result).toHaveLength(1);
            expect(result[0].quantity).toBe(5);
        });

        it('throws when the product does not exist', async () => {
            await expect(
                new ListStockMovementsUseCase(products, movements).execute({ productId: 'missing' }),
            ).rejects.toBeInstanceOf(ProductNotFoundError);
        });
    });
});
