import { DomainError } from '../../../shared/domain/domain.error.js';

export class UsernameAlreadyExistsError extends DomainError {
    constructor() {
        super('Username already exists');
    }
}
