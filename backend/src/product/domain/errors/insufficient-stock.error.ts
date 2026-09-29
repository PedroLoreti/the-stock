import { DomainError } from '../../../shared/domain/domain.error.js';

export class InsufficientStockError extends DomainError {
    constructor() {
        super('Insufficient stock quantity');
    }
}
