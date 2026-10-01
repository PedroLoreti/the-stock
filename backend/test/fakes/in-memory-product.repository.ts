import { Product, ProductProps } from '../../src/product/domain/entities/product.entity.js';
import { FindAllProductsOptions, ProductRepository } from '../../src/product/domain/repositories/product.repository.js';
import { Page, paginateArray } from '../../src/shared/application/pagination.js';
import { ConcurrencyError } from '../../src/shared/domain/concurrency.error.js';
import { Snapshotable } from './snapshotable.js';

function toProps(product: Product): ProductProps {
    return {
        id: product.id,
        name: product.name,
        description: product.description,
        sku: product.sku,
        price: product.price,
        quantity: product.quantity,
        minStock: product.minStock,
        active: product.active,
        version: product.version,
    };
}

/**
 * Guarda apenas dados (não as entidades), igual a um banco: cada leitura devolve
 * uma entidade nova via `restore`, e o `save` aplica o mesmo lock otimista do repositório Prisma.
 */
export class InMemoryProductRepository implements ProductRepository, Snapshotable {
    private rows = new Map<string, ProductProps>();

    async save(product: Product): Promise<void> {
        const current = this.rows.get(product.id);
        if (!current) {
            this.rows.set(product.id, toProps(product));
            return;
        }
        if (current.version !== product.version) {
            throw new ConcurrencyError();
        }
        this.rows.set(product.id, { ...toProps(product), version: product.version + 1 });
    }

    async findById(id: string): Promise<Product | null> {
        const row = this.rows.get(id);
        return row ? Product.restore({ ...row }) : null;
    }

    async findBySku(sku: string): Promise<Product | null> {
        const row = [...this.rows.values()].find((item) => item.sku === sku);
        return row ? Product.restore({ ...row }) : null;
    }

    async findManyByIds(ids: string[]): Promise<Product[]> {
        return ids.flatMap((id) => {
            const row = this.rows.get(id);
            return row ? [Product.restore({ ...row })] : [];
        });
    }

    async findAll(options: FindAllProductsOptions): Promise<Page<Product>> {
        const search = options.search?.trim().toLowerCase();
        const matching = [...this.rows.values()]
            .filter((row) => options.includeInactive || row.active)
            .filter(
                (row) => !search || row.name.toLowerCase().includes(search) || row.sku.toLowerCase().includes(search),
            )
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((row) => Product.restore({ ...row }));
        return paginateArray(matching, options);
    }

    snapshot(): unknown {
        return new Map([...this.rows].map(([id, row]) => [id, { ...row }]));
    }

    restore(snapshot: unknown): void {
        this.rows = snapshot as Map<string, ProductProps>;
    }
}
