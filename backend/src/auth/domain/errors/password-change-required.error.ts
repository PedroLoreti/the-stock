import { DomainError } from '../../../shared/domain/domain.error.js';

export class PasswordChangeRequiredError extends DomainError {
    constructor() {
        super('You must change your password before continuing');
    }
}
