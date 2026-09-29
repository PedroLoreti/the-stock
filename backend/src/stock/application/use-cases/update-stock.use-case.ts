import { Injectable } from '@nestjs/common';
import { Stock } from '../../domain/entities/stock.entity.js';
import { StockRepository } from '../../domain/repositories/stock.repository.js';
import { CodeAlreadyExistsError } from '../../domain/errors/code-already-exists.error.js';
import { StockNotFoundError } from '../../domain/errors/stock-not-found.error.js';

export interface UpdateStockInput {
    id: string;
    name?: string;
    description?: string;
}

@Injectable()
export class UpdateStockUseCase {
    constructor(private readonly stockRepository: StockRepository) {}

    async execute(input: UpdateStockInput): Promise<Stock> {
        const stock = await this.stockRepository.findById(input.id);
        if (!stock) {
            throw new StockNotFoundError();
        }

        stock.update(input);
        await this.stockRepository.save(stock);

        return stock;
    }
}
