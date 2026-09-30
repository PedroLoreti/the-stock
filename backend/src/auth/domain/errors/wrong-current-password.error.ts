import { DomainError } from '../../../shared/domain/domain.error.js';

export class WrongCurrentPasswordError extends DomainError {
    constructor() {
        super('Current password is incorrect');
    }
}
