import { Page, PageRequest } from '../../../shared/application/pagination.js';
import { Sale } from '../entities/sale.entity.js';

export abstract class SaleRepository {
    abstract save(sale: Sale): Promise<void>;
    abstract findById(id: string): Promise<Sale | null>;
    /** Mais recentes primeiro. */
    abstract findAll(request: PageRequest): Promise<Page<Sale>>;
}
