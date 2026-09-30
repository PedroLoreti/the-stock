import { InvalidPasswordError } from './errors/invalid-password.error.js';

export const PASSWORD_MIN_LENGTH = 8;
/** Limite do bcrypt: bytes além do 72º são ignorados silenciosamente. */
export const PASSWORD_MAX_LENGTH = 72;

/**
 * Regra de senha do domínio. Fica aqui (e não no DTO) para valer em qualquer
 * porta de entrada: HTTP, seed do admin, scripts.
 */
export function assertValidPassword(password: string): void {
    if (typeof password !== 'string' || password.trim().length === 0) {
        throw new InvalidPasswordError('Password is required');
    }
    if (password.length < PASSWORD_MIN_LENGTH) {
        throw new InvalidPasswordError(`Password must have at least ${PASSWORD_MIN_LENGTH} characters`);
    }
    if (password.length > PASSWORD_MAX_LENGTH) {
        throw new InvalidPasswordError(`Password must have at most ${PASSWORD_MAX_LENGTH} characters`);
    }
}
