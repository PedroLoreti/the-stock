import { CreateProductProps, Product } from '../../src/product/domain/entities/product.entity.js';

let skuCounter = 0;

/** Cria um produto válido; sobrescreva só o que importa para o teste. */
export function makeProduct(overrides: Partial<CreateProductProps> = {}): Product {
    skuCounter++;
    return Product.create({
        name: 'Caneta Azul',
        description: 'Esferográfica',
        sku: `TS-${skuCounter}`,
        price: 2.5,
        quantity: 10,
        ...overrides,
    });
}
