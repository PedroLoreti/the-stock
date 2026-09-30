import { InMemoryProductRepository } from '../../../../test/fakes/in-memory-product.repository.js';
import { InMemoryStockMovementRepository } from '../../../../test/fakes/in-memory-stock-movement.repository.js';
import { InMemoryUnitOfWork } from '../../../../test/fakes/in-memory-unit-of-work.js';
import { makeProduct } from '../../../../test/factories/product.factory.js';
import { StockMovementType } from '../../domain/entities/stock-movement.entity.js';
import { InvalidProductError } from '../../domain/errors/invalid-product.error.js';
import { SkuAlreadyExistsError } from '../../domain/errors/sku-already-exists.error.js';
import { CreateProductUseCase } from './create-product.use-case.js';

describe('CreateProductUseCase', () => {
    let products: InMemoryProductRepository;
    let movements: InMemoryStockMovementRepository;
    let useCase: CreateProductUseCase;

    const input = { name: 'Caneta Azul', description: 'Esferográfica', sku: 'TS-1', price: 2.5, quantity: 10 };

    beforeEach(() => {
        products = new InMemoryProductRepository();
        movements = new InMemoryStockMovementRepository();
        useCase = new CreateProductUseCase(products, movements, new InMemoryUnitOfWork(products, movements));
    });

    it('creates the product and an ENTRY movement for the initial quantity', async () => {
        const product = await useCase.execute(input);

        expect(await products.findById(product.id)).not.toBeNull();
        expect(movements.all()).toEqual([
            expect.objectContaining({ productId: product.id, type: StockMovementType.ENTRY, quantity: 10 }),
        ]);
    });

    it('does not create a movement when the initial quantity is zero', async () => {
        await useCase.execute({ ...input, quantity: 0 });

        expect(movements.all()).toHaveLength(0);
    });

    it('rejects a sku that is already in use', async () => {
        await products.save(makeProduct({ sku: 'TS-1' }));

        await expect(useCase.execute(input)).rejects.toBeInstanceOf(SkuAlreadyExistsError);
        expect(await products.findAll()).toHaveLength(1);
    });

    it('propagates domain validation errors without persisting anything', async () => {
        await expect(useCase.execute({ ...input, price: 0 })).rejects.toBeInstanceOf(InvalidProductError);

        expect(await products.findAll()).toHaveLength(0);
        expect(movements.all()).toHaveLength(0);
    });
});
