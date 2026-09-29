import { Product } from '../entities/product.entity.js';

export abstract class ProductRepository {
    abstract save(product: Product): Promise<void>;
    abstract findById(id: string): Promise<Product | null>;
    abstract findBySku(sku: string): Promise<Product | null>;
    abstract findManyByIds(ids: string[]): Promise<Product[]>;
    abstract findAll(): Promise<Product[]>;
}
