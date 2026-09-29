import { DomainError } from '../../../shared/domain/domain.error.js';

export class ProductNotFoundError extends DomainError {
    constructor() {
        super('Product not found');
    }
}
