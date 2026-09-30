import { DomainError } from '../../../shared/domain/domain.error.js';

export class InvalidRefreshTokenError extends DomainError {
    constructor() {
        super('Invalid or expired refresh token');
    }
}
