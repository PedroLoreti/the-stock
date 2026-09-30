import { DomainError } from '../../../shared/domain/domain.error.js';

export class EmailAlreadyExistsError extends DomainError {
    constructor() {
        super('Email already exists');
    }
}
