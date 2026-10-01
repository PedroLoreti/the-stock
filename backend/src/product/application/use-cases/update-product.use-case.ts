import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity.js';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';

export interface UpdateProductInput {
    id: string;
    name?: string;
    description?: string;
    price?: number;
    minStock?: number;
}

@Injectable()
export class UpdateProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(input: UpdateProductInput): Promise<Product> {
        const product = await this.productRepository.findById(input.id);
        if (!product) {
            throw new ProductNotFoundError();
        }

        const { id: _id, ...data } = input;
        product.update(data);
        await this.productRepository.save(product);

        return product;
    }
}
