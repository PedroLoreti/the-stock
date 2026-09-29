import { DomainError } from '../../../shared/domain/domain.error.js';

export class SaleNotFoundError extends DomainError {
    constructor() {
        super('Sale not found');
    }
}
