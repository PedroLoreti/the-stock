import { DomainError } from './domain.error.js';

export class CodeAlreadyExistsError extends DomainError {
    constructor() {
        super('Code already exists');
    }
}
