import { Product } from '../../domain/entities/product.entity.js';

export class ProductResponseDto {
    constructor(
        readonly id: string,
        readonly name: string,
        readonly brand: string,
        readonly description: string,
        readonly sku: string,
        readonly price: number,
        readonly quantity: number,
        readonly minStock: number,
        /** Regra do domínio: esgotado ou no limite mínimo. */
        readonly lowStock: boolean,
        readonly active: boolean,
    ) {}

    static fromEntity(product: Product): ProductResponseDto {
        return new ProductResponseDto(
            product.id,
            product.name,
            product.brand,
            product.description,
            product.sku,
            product.price,
            product.quantity,
            product.minStock,
            product.isLowStock,
            product.active,
        );
    }
}
