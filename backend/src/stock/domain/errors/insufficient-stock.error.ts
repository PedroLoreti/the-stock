import { DomainError } from './domain.error.js';

export class InsufficientStockError extends DomainError {
    constructor() {
        super('Insufficient stock quantity');
    }
}
