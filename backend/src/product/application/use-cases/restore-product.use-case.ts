import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity.js';
import { ProductNotFoundError } from '../../domain/errors/product-not-found.error.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';

export interface RestoreProductInput {
    id: string;
}

/** Reverte o soft delete. Só administradores podem chamar (regra aplicada na camada HTTP). */
@Injectable()
export class RestoreProductUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(input: RestoreProductInput): Promise<Product> {
        const product = await this.productRepository.findById(input.id);
        if (!product) {
            throw new ProductNotFoundError();
        }

        product.activate();
        await this.productRepository.save(product);

        return product;
    }
}
