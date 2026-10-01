import { InMemoryProductRepository } from '../../../../test/fakes/in-memory-product.repository.js';
import { InMemorySaleRepository } from '../../../../test/fakes/in-memory-sale.repository.js';
import { InMemoryStockMovementRepository } from '../../../../test/fakes/in-memory-stock-movement.repository.js';
import { InMemoryUnitOfWork } from '../../../../test/fakes/in-memory-unit-of-work.js';
import { makeProduct } from '../../../../test/factories/product.factory.js';
import { StockMovementType } from '../../../product/domain/entities/stock-movement.entity.js';
import { InsufficientStockError } from '../../../product/domain/errors/insufficient-stock.error.js';
import { ProductInactiveError } from '../../../product/domain/errors/product-inactive.error.js';
import { ProductNotFoundError } from '../../../product/domain/errors/product-not-found.error.js';
import { ConcurrencyError } from '../../../shared/domain/concurrency.error.js';
import { SaleStatus } from '../../domain/entities/sale.entity.js';
import { InvalidSaleError } from '../../domain/errors/invalid-sale.error.js';
import { CreateSaleUseCase } from './create-sale.use-case.js';

describe('CreateSaleUseCase', () => {
    let products: InMemoryProductRepository;
    let movements: InMemoryStockMovementRepository;
    let sales: InMemorySaleRepository;
    let useCase: CreateSaleUseCase;

    beforeEach(() => {
        products = new InMemoryProductRepository();
        movements = new InMemoryStockMovementRepository();
        sales = new InMemorySaleRepository();
        useCase = new CreateSaleUseCase(sales, products, movements, new InMemoryUnitOfWork(products, movements, sales));
    });

    it('creates the sale, lowers the stock and records a SALE movement per item', async () => {
        const pen = makeProduct({ price: 2.5, quantity: 10 });
        const pencil = makeProduct({ price: 1, quantity: 3 });
        await products.save(pen);
        await products.save(pencil);

        const sale = await useCase.execute({
            userId: 'user-1',
            items: [
                { productId: pen.id, quantity: 4 },
                { productId: pencil.id, quantity: 3 },
            ],
        });

        expect(sale.status).toBe(SaleStatus.COMPLETED);
        expect(sale.total).toBe(13); // 4 * 2.5 + 3 * 1
        expect((await products.findById(pen.id))!.quantity).toBe(6);
        expect((await products.findById(pencil.id))!.quantity).toBe(0);
        expect(await sales.findById(sale.id)).not.toBeNull();
        expect(movements.all()).toEqual([
            expect.objectContaining({ productId: pen.id, type: StockMovementType.SALE, quantity: 4, saleId: sale.id }),
            expect.objectContaining({
                productId: pencil.id,
                type: StockMovementType.SALE,
                quantity: 3,
                saleId: sale.id,
            }),
        ]);
    });

    it('snapshots the unit price at the time of the sale', async () => {
        const pen = makeProduct({ price: 2.5, quantity: 10 });
        await products.save(pen);

        const sale = await useCase.execute({ userId: 'user-1', items: [{ productId: pen.id, quantity: 1 }] });

        expect(sale.items[0].unitPrice).toBe(2.5);
    });

    it('rejects the whole sale when any item exceeds the stock, without writing anything', async () => {
        const pen = makeProduct({ quantity: 10 });
        const pencil = makeProduct({ quantity: 2 });
        await products.save(pen);
        await products.save(pencil);

        await expect(
            useCase.execute({
                userId: 'user-1',
                items: [
                    { productId: pen.id, quantity: 4 },
                    { productId: pencil.id, quantity: 3 },
                ],
            }),
        ).rejects.toBeInstanceOf(InsufficientStockError);

        expect((await products.findById(pen.id))!.quantity).toBe(10);
        expect(sales.count()).toBe(0);
        expect(movements.all()).toHaveLength(0);
    });

    it('rejects an unknown product', async () => {
        await expect(
            useCase.execute({ userId: 'user-1', items: [{ productId: 'missing', quantity: 1 }] }),
        ).rejects.toBeInstanceOf(ProductNotFoundError);
    });

    it('rejects an inactive product', async () => {
        const pen = makeProduct();
        pen.deactivate();
        await products.save(pen);

        await expect(
            useCase.execute({ userId: 'user-1', items: [{ productId: pen.id, quantity: 1 }] }),
        ).rejects.toBeInstanceOf(ProductInactiveError);
    });

    it('rejects the same product twice in one sale', async () => {
        const pen = makeProduct();
        await products.save(pen);

        await expect(
            useCase.execute({
                userId: 'user-1',
                items: [
                    { productId: pen.id, quantity: 1 },
                    { productId: pen.id, quantity: 1 },
                ],
            }),
        ).rejects.toBeInstanceOf(InvalidSaleError);
    });

    it('retries with fresh data when the product was changed concurrently', async () => {
        const pen = makeProduct({ quantity: 10 });
        await products.save(pen);
        vi.spyOn(products, 'save').mockRejectedValueOnce(new ConcurrencyError());

        const sale = await useCase.execute({ userId: 'user-1', items: [{ productId: pen.id, quantity: 4 }] });

        expect((await products.findById(pen.id))!.quantity).toBe(6);
        expect(sales.count()).toBe(1); // a venda da tentativa que falhou sofreu rollback
        expect(await sales.findById(sale.id)).not.toBeNull();
        expect(movements.all()).toHaveLength(1);
    });

    it('fails with ConcurrencyError after exhausting the retries, leaving no partial data', async () => {
        const pen = makeProduct({ quantity: 10 });
        await products.save(pen);
        vi.spyOn(products, 'save').mockRejectedValue(new ConcurrencyError());

        await expect(
            useCase.execute({ userId: 'user-1', items: [{ productId: pen.id, quantity: 4 }] }),
        ).rejects.toBeInstanceOf(ConcurrencyError);

        expect(products.save).toHaveBeenCalledTimes(5);
        expect((await products.findById(pen.id))!.quantity).toBe(10);
        expect(sales.count()).toBe(0);
        expect(movements.all()).toHaveLength(0);
    });
});
