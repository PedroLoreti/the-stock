import { Product } from '../../domain/entities/product.entity.js';

export class ProductResponseDto {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly description: string,
        readonly sku: string,
        readonly price: number,
        readonly quantity: number,
        readonly active: boolean,
    ) {}

    static fromEntity(product: Product): ProductResponseDto {
        return new ProductResponseDto(
            product.id,
            product.name,
            product.description,
            product.sku,
            product.price,
            product.quantity,
            product.active,
        );
    }
}
