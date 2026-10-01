import { Page, PageRequest } from '../../../shared/application/pagination.js';
import { Product } from '../entities/product.entity.js';

export interface FindAllProductsOptions extends PageRequest {
    /** Por padrão só os ativos são listados. */
    includeInactive?: boolean;
    /** Trecho do nome ou do SKU, sem distinguir maiúsculas. */
    search?: string;
}

export abstract class ProductRepository {
    abstract save(product: Product): Promise<void>;
    abstract findById(id: string): Promise<Product | null>;
    abstract findBySku(sku: string): Promise<Product | null>;
    abstract findManyByIds(ids: string[]): Promise<Product[]>;
    abstract findAll(options: FindAllProductsOptions): Promise<Page<Product>>;
}
