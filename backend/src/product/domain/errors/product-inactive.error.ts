import { DomainError } from '../../../shared/domain/domain.error.js';

export class ProductInactiveError extends DomainError {
    constructor() {
        super('Product is inactive');
    }
}
