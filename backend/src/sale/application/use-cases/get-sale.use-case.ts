import { Injectable } from '@nestjs/common';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleNotFoundError } from '../../domain/errors/sale-not-found.error.js';
import { SaleRepository } from '../../domain/repositories/sale.repository.js';

export interface GetSaleInput {
    id: string;
}

@Injectable()
export class GetSaleUseCase {
    constructor(private readonly saleRepository: SaleRepository) {}

    async execute(input: GetSaleInput): Promise<Sale> {
        const sale = await this.saleRepository.findById(input.id);
        if (!sale) {
            throw new SaleNotFoundError();
        }
        return sale;
    }
}
