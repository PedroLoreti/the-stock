import { InMemorySaleRepository } from '../../../../test/fakes/in-memory-sale.repository.js';
import { makeSale } from '../../../../test/factories/sale.factory.js';
import { SaleNotFoundError } from '../../domain/errors/sale-not-found.error.js';
import { GetSaleUseCase } from './get-sale.use-case.js';
import { ListSalesUseCase } from './list-sales.use-case.js';

describe('Sale read use cases', () => {
    let sales: InMemorySaleRepository;

    beforeEach(() => {
        sales = new InMemorySaleRepository();
    });

    it('GetSaleUseCase returns the sale with its items', async () => {
        const sale = makeSale();
        await sales.save(sale);

        const result = await new GetSaleUseCase(sales).execute({ id: sale.id });

        expect(result.id).toBe(sale.id);
        expect(result.items).toHaveLength(1);
    });

    it('GetSaleUseCase throws when the sale does not exist', async () => {
        await expect(new GetSaleUseCase(sales).execute({ id: 'missing' })).rejects.toBeInstanceOf(SaleNotFoundError);
    });

    it('ListSalesUseCase returns every sale, newest first', async () => {
        const older = makeSale({ createdAt: new Date('2026-09-01T00:00:00Z') });
        const newer = makeSale({ createdAt: new Date('2026-09-02T00:00:00Z') });
        await sales.save(older);
        await sales.save(newer);

        const result = await new ListSalesUseCase(sales).execute();

        expect(result.map((sale) => sale.id)).toEqual([newer.id, older.id]);
    });
});
