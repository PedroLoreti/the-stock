import { Injectable } from '@nestjs/common';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleRepository } from '../../domain/repositories/sale.repository.js';

@Injectable()
export class ListSalesUseCase {
    constructor(private readonly saleRepository: SaleRepository) {}

    async execute(): Promise<Sale[]> {
        return this.saleRepository.findAll();
    }
}
