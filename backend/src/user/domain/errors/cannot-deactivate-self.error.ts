import { DomainError } from '../../../shared/domain/domain.error.js';

export class CannotDeactivateSelfError extends DomainError {
    constructor() {
        super('You cannot deactivate your own user');
    }
}
