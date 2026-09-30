import { DomainError } from '../../../shared/domain/domain.error.js';

/** Mensagem propositalmente genérica: não revela se o login existe ou se a senha está errada. */
export class InvalidCredentialsError extends DomainError {
    constructor() {
        super('Invalid credentials');
    }
}
