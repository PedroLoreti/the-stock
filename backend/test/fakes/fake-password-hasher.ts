import { PasswordHasher } from '../../src/user/application/ports/password-hasher.js';

/** Hash reversível e instantâneo, só para testes. Nunca use fora deles. */
export class FakePasswordHasher implements PasswordHasher {
    async hash(plain: string): Promise<string> {
        return `hashed:${plain}`;
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return hash === `hashed:${plain}`;
    }
}
