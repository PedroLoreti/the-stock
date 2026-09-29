import { DomainError } from '../../../shared/domain/domain.error.js';

export class SaleCancellationWindowExpiredError extends DomainError {
    constructor() {
        super('Sale can only be cancelled within 5 hours of its creation');
    }
}
