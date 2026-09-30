import { AccessTokenPayload, TokenService } from '../../src/auth/application/ports/token-service.js';

/** Codifica o payload em base64 sem assinatura. Só para testes. */
export class FakeTokenService implements TokenService {
    async signAccessToken(payload: AccessTokenPayload): Promise<string> {
        return Buffer.from(JSON.stringify(payload)).toString('base64url');
    }

    async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
        return JSON.parse(Buffer.from(token, 'base64url').toString()) as AccessTokenPayload;
    }
}
