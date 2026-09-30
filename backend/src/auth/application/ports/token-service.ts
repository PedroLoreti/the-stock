import { UserRole } from '../../../user/domain/entities/user.entity.js';

export interface AccessTokenPayload {
    /** id do usuário (claim padrão "subject" do JWT). */
    sub: string;
    role: UserRole;
    mustChangePassword: boolean;
}

/** Assina e verifica o access token. A implementação real usa JWT; os testes usam um fake. */
export abstract class TokenService {
    abstract signAccessToken(payload: AccessTokenPayload): Promise<string>;
    /** Lança se o token for inválido ou expirado. */
    abstract verifyAccessToken(token: string): Promise<AccessTokenPayload>;
}
