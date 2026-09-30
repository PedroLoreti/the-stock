import { Injectable } from '@nestjs/common';
import { StockMovement } from '../../domain/entities/stock-movement.entity.js';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';
import { StockMovementRepository } from '../../domain/repositories/stock-movement.repository.js';

export interface ListStockMovementsInput {
    productId: string;
}

@Injectable()
export class ListStockMovementsUseCase {
    constructor(
        private readonly productRepository: ProductRepository,
        private readonly stockMovementRepository: StockMovementRepository,
    ) {}

    async execute(input: ListStockMovementsInput): Promise<StockMovement[]> {
        const product = await this.productRepository.findById(input.productId);
        if (!product) {
            throw new ProductNotFoundError();
        }

        return this.stockMovementRepository.findByProductId(product.id);
    }
}
