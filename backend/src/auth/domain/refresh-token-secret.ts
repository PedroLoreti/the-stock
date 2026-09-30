import { createHash, randomBytes } from 'node:crypto';

/**
 * O refresh token é um segredo aleatório opaco (não é um JWT). O cliente recebe o segredo;
 * o banco guarda só o SHA-256 dele. Como o segredo tem 384 bits de entropia, o SHA-256 basta
 * (bcrypt seria desnecessário e lento aqui).
 */
export function generateRefreshTokenSecret(): string {
    return randomBytes(48).toString('base64url');
}

export function hashRefreshTokenSecret(secret: string): string {
    return createHash('sha256').update(secret).digest('hex');
}
