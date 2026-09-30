import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../../shared/application/unit-of-work.js';
import { StockMovement } from '../../../product/domain/entities/stock-movement.entity.js';
import { ProductNotFoundError } from '../../../product/domain/errors/product-not-found.error.js';
import { ProductRepository } from '../../../product/domain/repositories/product.repository.js';
import { StockMovementRepository } from '../../../product/domain/repositories/stock-movement.repository.js';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleItem } from '../../domain/entities/sale-item.entity.js';
import { InvalidSaleError } from '../../domain/errors/invalid-sale.error.js';
import { SaleRepository } from '../../domain/repositories/sale.repository.js';

export interface CreateSaleItemInput {
    productId: string;
    quantity: number;
}

export interface CreateSaleInput {
    items: CreateSaleItemInput[];
}

@Injectable()
export class CreateSaleUseCase {
    constructor(
        private readonly saleRepository: SaleRepository,
        private readonly productRepository: ProductRepository,
        private readonly stockMovementRepository: StockMovementRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async execute(input: CreateSaleInput): Promise<Sale> {
        const productIds = input.items.map((item) => item.productId);
        if (new Set(productIds).size !== productIds.length) {
            throw new InvalidSaleError('The same product cannot appear twice in a sale');
        }

        const products = await this.productRepository.findManyByIds(productIds);
        const productsById = new Map(products.map((product) => [product.id, product]));

        const saleItems = input.items.map((item) => {
            const product = productsById.get(item.productId);
            if (!product) {
                throw new ProductNotFoundError();
            }

            product.removeQuantity(item.quantity);

            return SaleItem.create({
                productId: product.id,
                quantity: item.quantity,
                unitPrice: product.price,
            });
        });

        const sale = Sale.create(saleItems);

        await this.unitOfWork.run(async () => {
            await this.saleRepository.save(sale);

            for (const item of sale.items) {
                const product = productsById.get(item.productId)!;
                await this.productRepository.save(product);
                await this.stockMovementRepository.save(StockMovement.sale(product.id, item.quantity, sale.id));
            }
        });

        return sale;
    }
}
