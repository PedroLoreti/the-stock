export abstract class AuthConfig {
    /** Validade do refresh token, em milissegundos. */
    abstract readonly refreshTokenTtlMs: number;
}
