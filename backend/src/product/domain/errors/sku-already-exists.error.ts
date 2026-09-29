import { DomainError } from '../../../shared/domain/domain.error.js';

export class SkuAlreadyExistsError extends DomainError {
    constructor() {
        super('SKU already exists');
    }
}
