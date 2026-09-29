import { Stock } from '../entities/stock.entity.js';

export abstract class StockRepository {
    abstract save(stock: Stock): Promise<void>;
    abstract findById(id: string): Promise<Stock | null>;
    abstract findByCode(code: number): Promise<Stock | null>;
    abstract findAll(): Promise<Stock[]>;
    abstract delete(id: string): Promise<void>;
}
