import { InMemoryProductRepository } from '../../../../test/fakes/in-memory-product.repository.js';
import { InMemoryStockMovementRepository } from '../../../../test/fakes/in-memory-stock-movement.repository.js';
import { InMemoryUnitOfWork } from '../../../../test/fakes/in-memory-unit-of-work.js';
import { makeProduct } from '../../../../test/factories/product.factory.js';
import { ConcurrencyError } from '../../../shared/domain/concurrency.error.js';
import { StockMovementType } from '../../domain/entities/stock-movement.entity.js';
import { ProductInactiveError } from '../../domain/errors/product-inactive.error.js';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error.js';
import { RegisterStockEntryUseCase } from './register-stock-entry.use-case.js';

describe('RegisterStockEntryUseCase', () => {
    let products: InMemoryProductRepository;
    let movements: InMemoryStockMovementRepository;
    let useCase: RegisterStockEntryUseCase;

    beforeEach(() => {
        products = new InMemoryProductRepository();
        movements = new InMemoryStockMovementRepository();
        useCase = new RegisterStockEntryUseCase(products, movements, new InMemoryUnitOfWork(products, movements));
    });

    it('adds the quantity and records an ENTRY movement', async () => {
        const product = makeProduct({ quantity: 10 });
        await products.save(product);

        const result = await useCase.execute({ productId: product.id, quantity: 5 });

        expect(result.quantity).toBe(15);
        expect((await products.findById(product.id))!.quantity).toBe(15);
        expect(movements.all()).toEqual([
            expect.objectContaining({ productId: product.id, type: StockMovementType.ENTRY, quantity: 5 }),
        ]);
    });

    it('rejects an unknown product', async () => {
        await expect(useCase.execute({ productId: 'missing', quantity: 1 })).rejects.toBeInstanceOf(
            ProductNotFoundError,
        );
    });

    it('rejects entries on an inactive product and records nothing', async () => {
        const product = makeProduct();
        product.deactivate();
        await products.save(product);

        await expect(useCase.execute({ productId: product.id, quantity: 1 })).rejects.toBeInstanceOf(
            ProductInactiveError,
        );
        expect(movements.all()).toHaveLength(0);
    });

    it('retries when another operation changed the product in the meantime', async () => {
        const product = makeProduct({ quantity: 10 });
        await products.save(product);
        vi.spyOn(products, 'save').mockRejectedValueOnce(new ConcurrencyError());

        const result = await useCase.execute({ productId: product.id, quantity: 5 });

        expect(result.quantity).toBe(15);
        expect(products.save).toHaveBeenCalledTimes(2);
        expect(movements.all()).toHaveLength(1);
    });
});
