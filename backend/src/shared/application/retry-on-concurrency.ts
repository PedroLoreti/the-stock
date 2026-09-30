import { setTimeout as sleep } from 'node:timers/promises';
import { ConcurrencyError } from '../domain/concurrency.error.js';

const DEFAULT_ATTEMPTS = 5;
const MAX_BACKOFF_MS = 50;

/**
 * Executa `work` novamente quando ele falha com ConcurrencyError.
 * Cada tentativa deve reler os dados do zero, por isso recebe uma função e não um valor.
 * Entre as tentativas espera um tempo aleatório curto, para que requisições que colidiram
 * não voltem a colidir exatamente no mesmo instante.
 */
export async function retryOnConcurrency<T>(work: () => Promise<T>, attempts = DEFAULT_ATTEMPTS): Promise<T> {
    let lastError: unknown;

    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await work();
        } catch (error) {
            if (!(error instanceof ConcurrencyError)) {
                throw error;
            }
            lastError = error;
            if (attempt < attempts) {
                await sleep(Math.random() * MAX_BACKOFF_MS);
            }
        }
    }

    throw lastError;
}
