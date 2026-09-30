import { DomainError } from '../../../shared/domain/domain.error.js';

export class UserInactiveError extends DomainError {
    constructor() {
        super('User is inactive');
    }
}
