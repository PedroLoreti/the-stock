import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity.js';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';

export interface DeactivateProductInput {
    id: string;
}

@Injectable()
export class DeactivateProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(input: DeactivateProductInput): Promise<Product> {
        const product = await this.productRepository.findById(input.id);
        if (!product) {
            throw new ProductNotFoundError();
        }

        product.deactivate();
        await this.productRepository.save(product);

        return product;
    }
}
