import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity.js';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';

export interface GetProductInput {
    id: string;
}

@Injectable()
export class GetProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(input: GetProductInput): Promise<Product> {
        const product = await this.productRepository.findById(input.id);
        if (!product) {
            throw new ProductNotFoundError();
        }
        return product;
    }
}
