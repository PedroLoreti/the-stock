import { Sale } from '../entities/sale.entity.js';

export abstract class SaleRepository {
    abstract save(sale: Sale): Promise<void>;
    abstract findById(id: string): Promise<Sale | null>;
    abstract findAll(): Promise<Sale[]>;
}
