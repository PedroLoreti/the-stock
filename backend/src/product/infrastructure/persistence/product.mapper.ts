import type { Product as ProductRow } from '../../../generated/prisma/client.js';
import { Product } from '../../domain/entities/product.entity.js';

export class ProductMapper {
    static toDomain(row: ProductRow): Product {
        return Product.restore({
            id: row.id,
            name: row.name,
            description: row.description,
            sku: row.sku,
            price: row.price.toNumber(),
            quantity: row.quantity,
            active: row.active,
            version: row.version,
        });
    }

    static toPersistence(product: Product) {
        return {
            id: product.id,
            name: product.name,
            description: product.description,
            sku: product.sku,
            price: product.price,
            quantity: product.quantity,
            active: product.active,
            version: product.version,
        };
    }
}
