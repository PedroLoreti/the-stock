import { Injectable } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';

@Injectable()
export class ListProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(): Promise<Product[]> {
        return this.productRepository.findAll();
    }
}
