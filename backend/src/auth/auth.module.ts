import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { optionalEnv, parseDurationMs, requireEnv } from '../shared/infrastructure/config/env.js';
import { UserModule } from '../user/user.module.js';
import { AuthConfig } from './application/ports/auth-config.js';
import { TokenService } from './application/ports/token-service.js';
import { TokenIssuer } from './application/services/token-issuer.js';
import { ChangePasswordUseCase } from './application/use-cases/change-password.use-case.js';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case.js';
import { LoginUseCase } from './application/use-cases/login.use-case.js';
import { LogoutUseCase } from './application/use-cases/logout.use-case.js';
import { RefreshTokensUseCase } from './application/use-cases/refresh-tokens.use-case.js';
import { RefreshTokenRepository } from './domain/repositories/refresh-token.repository.js';
import { EnvAuthConfig } from './infrastructure/env-auth-config.js';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/prisma-refresh-token.repository.js';
import { JwtTokenService } from './infrastructure/security/jwt-token.service.js';

@Module({
    imports: [
        UserModule,
        JwtModule.registerAsync({
            // Lido na inicialização, depois do dotenv: sem JWT_SECRET a aplicação não sobe.
            useFactory: () => ({
                secret: requireEnv('JWT_SECRET'),
                // Em segundos: o jsonwebtoken aceita número ou o formato do pacote "ms".
                signOptions: { expiresIn: parseDurationMs(optionalEnv('JWT_ACCESS_TTL', '15m')) / 1000 },
            }),
        }),
    ],
    providers: [
        { provide: RefreshTokenRepository, useClass: PrismaRefreshTokenRepository },
        { provide: TokenService, useClass: JwtTokenService },
        { provide: AuthConfig, useClass: EnvAuthConfig },
        TokenIssuer,
        LoginUseCase,
        RefreshTokensUseCase,
        LogoutUseCase,
        ChangePasswordUseCase,
        GetCurrentUserUseCase,
    ],
    exports: [TokenService],
})
export class AuthModule {}
