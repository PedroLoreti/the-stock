import { DomainError } from '../../../shared/domain/domain.error.js';

export class UserNotFoundError extends DomainError {
    constructor() {
        super('User not found');
    }
}
