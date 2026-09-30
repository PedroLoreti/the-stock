import { Injectable } from '@nestjs/common';
import { UnitOfWork } from '../../../shared/application/unit-of-work.js';
import { Product } from '../../domain/entities/product.entity.js';
import { StockMovement } from '../../domain/entities/stock-movement.entity.js';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';
import { StockMovementRepository } from '../../domain/repositories/stock-movement.repository.js';

export interface RegisterStockEntryInput {
    productId: string;
    quantity: number;
}

@Injectable()
export class RegisterStockEntryUseCase {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly stockMovementRepository: StockMovementRepository,
        private readonly unitOfWork: UnitOfWork,
    ) {}

    async execute(input: RegisterStockEntryInput): Promise<Product> {
        const product = await this.productRepository.findById(input.productId);
        if (!product) {
            throw new ProductNotFoundError();
        }

        product.addQuantity(input.quantity);
        const movement = StockMovement.entry(product.id, input.quantity);

        await this.unitOfWork.run(async () => {
            await this.productRepository.save(product);
            await this.stockMovementRepository.save(movement);
        });

        return product;
    }
}
