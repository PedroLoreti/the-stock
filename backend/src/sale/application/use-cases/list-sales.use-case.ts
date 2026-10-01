import { Injectable } from '@nestjs/common';
import { Page, PageRequest, pageRequest } from '../../../shared/application/pagination.js';
import { Sale } from '../../domain/entities/sale.entity.js';
import { SaleRepository } from '../../domain/repositories/sale.repository.js';

export type ListSalesInput = Partial<PageRequest>;

@Injectable()
export class ListSalesUseCase {
    constructor(private readonly saleRepository: SaleRepository) {}

    async execute(input: ListSalesInput = {}): Promise<Page<Sale>> {
        return this.saleRepository.findAll(pageRequest(input));
    }
}
