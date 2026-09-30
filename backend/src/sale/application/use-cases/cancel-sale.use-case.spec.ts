import { InMemoryProductRepository } from '../../../../test/fakes/in-memory-product.repository.js';
import { InMemorySaleRepository } from '../../../../test/fakes/in-memory-sale.repository.js';
import { InMemoryStockMovementRepository } from '../../../../test/fakes/in-memory-stock-movement.repository.js';
import { InMemoryUnitOfWork } from '../../../../test/fakes/in-memory-unit-of-work.js';
import { makeProduct } from '../../../../test/factories/product.factory.js';
import { makeSale, makeSaleItem } from '../../../../test/factories/sale.factory.js';
import { StockMovementType } from '../../../product/domain/entities/stock-movement.entity.js';
import { ProductInactiveError } from '../../../product/domain/errors/product-inactive.error.js';
import { SaleStatus } from '../../domain/entities/sale.entity.js';
import { SaleAlreadyCancelledError } from '../../domain/errors/sale-already-cancelled.error.js';
import { SaleCancellationWindowExpiredError } from '../../domain/errors/sale-cancellation-window-expired.error.js';
import { SaleNotFoundError } from '../../domain/errors/sale-not-found.error.js';
import { CancelSaleUseCase } from './cancel-sale.use-case.js';

const HOUR = 60 * 60 * 1000;

describe('CancelSaleUseCase', () => {
    let products: InMemoryProductRepository;
    let movements: InMemoryStockMovementRepository;
    let sales: InMemorySaleRepository;
    let useCase: CancelSaleUseCase;

    beforeEach(() => {
        products = new InMemoryProductRepository();
        movements = new InMemoryStockMovementRepository();
        sales = new InMemorySaleRepository();
        useCase = new CancelSaleUseCase(sales, products, movements, new InMemoryUnitOfWork(products, movements, sales));
    });

    it('cancels the sale, restores the stock and records a SALE_CANCELLATION per item', async () => {
        const pen = makeProduct({ quantity: 6 });
        await products.save(pen);
        const sale = makeSale({ items: [makeSaleItem({ productId: pen.id, quantity: 4 })] });
        await sales.save(sale);

        const result = await useCase.execute({ id: sale.id });

        expect(result.status).toBe(SaleStatus.CANCELLED);
        expect(result.cancelledAt).toBeInstanceOf(Date);
        expect((await sales.findById(sale.id))!.status).toBe(SaleStatus.CANCELLED);
        expect((await products.findById(pen.id))!.quantity).toBe(10);
        expect(movements.all()).toEqual([
            expect.objectContaining({
                productId: pen.id,
                type: StockMovementType.SALE_CANCELLATION,
                quantity: 4,
                saleId: sale.id,
            }),
        ]);
    });

    it('throws when the sale does not exist', async () => {
        await expect(useCase.execute({ id: 'missing' })).rejects.toBeInstanceOf(SaleNotFoundError);
    });

    it('rejects a sale that is already cancelled', async () => {
        const sale = makeSale({ status: SaleStatus.CANCELLED, cancelledAt: new Date() });
        await sales.save(sale);

        await expect(useCase.execute({ id: sale.id })).rejects.toBeInstanceOf(SaleAlreadyCancelledError);
    });

    it('rejects a sale older than 5 hours and changes nothing', async () => {
        const pen = makeProduct({ quantity: 6 });
        await products.save(pen);
        const sale = makeSale({
            items: [makeSaleItem({ productId: pen.id, quantity: 4 })],
            createdAt: new Date(Date.now() - 6 * HOUR),
        });
        await sales.save(sale);

        await expect(useCase.execute({ id: sale.id })).rejects.toBeInstanceOf(SaleCancellationWindowExpiredError);

        expect((await sales.findById(sale.id))!.status).toBe(SaleStatus.COMPLETED);
        expect((await products.findById(pen.id))!.quantity).toBe(6);
        expect(movements.all()).toHaveLength(0);
    });

    it('rejects the cancellation when a product is inactive and changes nothing', async () => {
        const pen = makeProduct({ quantity: 6 });
        pen.deactivate();
        await products.save(pen);
        const sale = makeSale({ items: [makeSaleItem({ productId: pen.id, quantity: 4 })] });
        await sales.save(sale);

        await expect(useCase.execute({ id: sale.id })).rejects.toBeInstanceOf(ProductInactiveError);

        expect((await sales.findById(sale.id))!.status).toBe(SaleStatus.COMPLETED);
        expect(movements.all()).toHaveLength(0);
    });
});
