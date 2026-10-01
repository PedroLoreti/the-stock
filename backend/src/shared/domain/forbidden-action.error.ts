import { DomainError } from './domain.error.js';

/** O usuário está autenticado, mas não tem permissão para esta ação. Vira 403 na camada HTTP. */
export class ForbiddenActionError extends DomainError {
    constructor(message = 'You are not allowed to perform this action') {
        super(message);
    }
}
