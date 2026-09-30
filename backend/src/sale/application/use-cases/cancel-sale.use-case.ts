import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../../shared/application/unit-of-work.js';
import { StockMovement } from '../../../product/domain/entities/stock-movement.entity.js';
import { ProductNotFoundError } from '../../../product/domain/errors/product-not-found.error.js';
import { ProductRepository } from '../../../product/domain/repositories/product.repository.js';
import { StockMovementRepository } from '../../../product/domain/repositories/stock-movement.repository.js';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleNotFoundError } from '../../domain/errors/sale-not-found.error.js';
import { SaleRepository } from '../../domain/repositories/sale.repository.js';

export interface CancelSaleInput {
    id: string;
}

@Injectable()
export class CancelSaleUseCase {
    constructor(
        private readonly saleRepository: SaleRepository,
        private readonly productRepository: ProductRepository,
        private readonly stockMovementRepository: StockMovementRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async execute(input: CancelSaleInput): Promise<Sale> {
        const sale = await this.saleRepository.findById(input.id);
        if (!sale) {
            throw new SaleNotFoundError();
        }

        sale.cancel(new Date());

        const productIds = sale.items.map((item) => item.productId);
        const products = await this.productRepository.findManyByIds(productIds);
        const productsById = new Map(products.map((product) => [product.id, product]));

        for (const item of sale.items) {
            const product = productsById.get(item.productId);
            if (!product) {
                throw new ProductNotFoundError();
            }
            product.addQuantity(item.quantity);
        }

        await this.unitOfWork.run(async () => {
            await this.saleRepository.save(sale);

            for (const item of sale.items) {
                const product = productsById.get(item.productId)!;
                await this.productRepository.save(product);
                await this.stockMovementRepository.save(
                    StockMovement.saleCancellation(product.id, item.quantity, sale.id),
                );
            }
        });

        return sale;
    }
}
