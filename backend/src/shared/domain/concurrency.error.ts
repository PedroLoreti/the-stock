import { DomainError } from './domain.error.js';

/**
 * Lançado quando uma gravação encontra a linha já alterada por outra operação
 * (lock otimista). Quem chama pode reler os dados e tentar de novo.
 */
export class ConcurrencyError extends DomainError {
    constructor() {
        super('The record was modified by another operation, please retry');
    }
}
