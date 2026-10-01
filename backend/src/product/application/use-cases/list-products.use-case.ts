import { Injectable } from '@nestjs/common';
import { Page, PageRequest, pageRequest } from '../../../shared/application/pagination.js';
import { ForbiddenActionError } from '../../../shared/domain/forbidden-action.error.js';
import { UserRole } from '../../../user/domain/entities/user.entity.js';
import { Product } from '../../domain/entities/product.entity.js';
import { ProductRepository } from '../../domain/repositories/product.repository.js';

export interface ListProductsInput extends Partial<PageRequest> {
    includeInactive?: boolean;
    /** Trecho do nome ou do SKU. */
    search?: string;
    /** Papel de quem pede; só administradores enxergam produtos desativados. */
    requesterRole?: UserRole;
}

@Injectable()
export class ListProductsUseCase {
    constructor(private readonly productRepository: ProductRepository) {}

    async execute(input: ListProductsInput = {}): Promise<Page<Product>> {
        const includeInactive = input.includeInactive ?? false;
        if (includeInactive && input.requesterRole !== UserRole.ADMIN) {
            throw new ForbiddenActionError('Only administrators can list inactive products');
        }
        return this.productRepository.findAll({ ...pageRequest(input), includeInactive, search: input.search });
    }
}
