import { DomainError } from '../../../shared/domain/domain.error.js';

export class SaleAlreadyCancelledError extends DomainError {
    constructor() {
        super('Sale is already cancelled');
    }
}
