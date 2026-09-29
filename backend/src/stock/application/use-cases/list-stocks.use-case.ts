import { Injectable } from '@nestjs/common';
import { Stock } from '../../domain/entities/stock.entity.js';
import { StockRepository } from '../../domain/repositories/stock.repository.js';

@Injectable()
export class ListStocksUseCase {
    constructor(private readonly stockRepository: StockRepository) {}

    async execute(): Promise<Stock[]> {
        return this.stockRepository.findAll();
    }
}
