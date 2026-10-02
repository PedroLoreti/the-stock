import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../../shared/application/unit-of-work.js';
import { Product } from '../../domain/entities/product.entity.js';
import { StockMovement } from '../../domain/entities/stock-movement.entity.js';
import { SkuAlreadyExistsError } from '../../domain/errors/sku-already-exists.error.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';
import { StockMovementRepository } from '../../domain/repositories/stock-movement.repository.js';

export interface CreateProductInput {
    name: string;
    brand: string;
    description: string;
    sku: string;
    price: number;
    quantity: number;
    minStock?: number;
}

@Injectable()
export class CreateProductUseCase {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly stockMovementRepository: StockMovementRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async execute(input: CreateProductInput): Promise<Product> {
        const skuInUse = await this.productRepository.findBySku(input.sku);
        if (skuInUse) {
            throw new SkuAlreadyExistsError();
        }

        const product = Product.create(input);

        await this.unitOfWork.run(async () => {
            await this.productRepository.save(product);

            if (product.quantity > 0) {
                await this.stockMovementRepository.save(StockMovement.entry(product.id, product.quantity));
            }
        });

        return product;
    }
}
