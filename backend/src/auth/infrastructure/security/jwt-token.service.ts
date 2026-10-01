import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenPayload, TokenService } from '../../application/ports/token-service.js';

@Injectable()
export class JwtTokenService implements TokenService {
    constructor(private readonly jwt: JwtService) {}

    signAccessToken(payload: AccessTokenPayload): Promise<string> {
        const { sub, ...claims } = payload;
        return this.jwt.signAsync(claims, { subject: sub });
    }

    async verifyAccessToken(token: string): Promise<AccessTokenPayload> {
        const decoded = await this.jwt.verifyAsync<Omit<AccessTokenPayload, 'sub'> & { sub: string }>(token);
        return { sub: decoded.sub, role: decoded.role, mustChangePassword: decoded.mustChangePassword };
    }
}
