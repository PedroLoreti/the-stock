import { AuthConfig } from '../../src/auth/application/ports/auth-config.js';

export class FakeAuthConfig implements AuthConfig {
    constructor(readonly refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000) {}
}
