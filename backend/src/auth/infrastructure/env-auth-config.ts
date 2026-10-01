import { Injectable } from '@nestjs/common';
import { optionalEnv, parseDurationMs } from '../../shared/infrastructure/config/env.js';
import { AuthConfig } from '../application/ports/auth-config.js';

@Injectable()
export class EnvAuthConfig implements AuthConfig {
    readonly refreshTokenTtlMs = parseDurationMs(optionalEnv('JWT_REFRESH_TTL', '7d'));
}
