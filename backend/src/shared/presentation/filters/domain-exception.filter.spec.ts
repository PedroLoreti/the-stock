import { ArgumentsHost } from '@nestjs/common';
import { InsufficientStockError } from '../../../product/domain/errors/insufficient-stock.error.js';
import { InvalidProductError } from '../../../product/domain/errors/invalid-product.error.js';
import { ProductInactiveError } from '../../../product/domain/errors/product-inactive.error.js';
import { ProductNotFoundError } from '../../../product/domain/errors/product-not-found.error.js';
import { SkuAlreadyExistsError } from '../../../product/domain/errors/sku-already-exists.error.js';
import { InvalidSaleError } from '../../../sale/domain/errors/invalid-sale.error.js';
import { SaleAlreadyCancelledError } from '../../../sale/domain/errors/sale-already-cancelled.error.js';
import { SaleCancellationWindowExpiredError } from '../../../sale/domain/errors/sale-cancellation-window-expired.error.js';
import { SaleNotFoundError } from '../../../sale/domain/errors/sale-not-found.error.js';
import { ConcurrencyError } from '../../domain/concurrency.error.js';
import { DomainError } from '../../domain/domain.error.js';
import { DomainExceptionFilter } from './domain-exception.filter.js';

function fakeHost() {
    const response = { status: vi.fn().mockReturnThis(), json: vi.fn() };
    const host = { switchToHttp: () => ({ getResponse: () => response }) } as unknown as ArgumentsHost;
    return { host, response };
}

describe('DomainExceptionFilter', () => {
    it.each<[DomainError, number]>([
        [new ProductNotFoundError(), 404],
        [new SaleNotFoundError(), 404],
        [new SkuAlreadyExistsError(), 409],
        [new ConcurrencyError(), 409],
        [new InsufficientStockError(), 422],
        [new ProductInactiveError(), 422],
        [new SaleAlreadyCancelledError(), 422],
        [new SaleCancellationWindowExpiredError(), 422],
        [new InvalidProductError('x'), 400],
        [new InvalidSaleError('x'), 400],
    ])('maps %s to HTTP %d', (error, status) => {
        const { host, response } = fakeHost();

        new DomainExceptionFilter().catch(error, host);

        expect(response.status).toHaveBeenCalledWith(status);
        expect(response.json).toHaveBeenCalledWith({ statusCode: status, error: error.name, message: error.message });
    });
});
