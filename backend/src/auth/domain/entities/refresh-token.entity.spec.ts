import { RefreshToken } from './refresh-token.entity.js';

const NOW = new Date('2026-09-30T12:00:00Z');
const LATER = new Date('2026-10-07T12:00:00Z');

describe('RefreshToken', () => {
    it('is usable when neither revoked nor expired', () => {
        const token = RefreshToken.create('user-1', 'hash', LATER, NOW);

        expect(token.isUsable(NOW)).toBe(true);
        expect(token.revokedAt).toBeNull();
    });

    it('is not usable once revoked, and revoking twice keeps the first timestamp', () => {
        const token = RefreshToken.create('user-1', 'hash', LATER, NOW);

        token.revoke(NOW);
        token.revoke(new Date(NOW.getTime() + 1000));

        expect(token.isRevoked()).toBe(true);
        expect(token.revokedAt).toEqual(NOW);
        expect(token.isUsable(NOW)).toBe(false);
    });

    it('expires exactly at expiresAt', () => {
        const token = RefreshToken.create('user-1', 'hash', LATER, NOW);

        expect(token.isExpired(new Date(LATER.getTime() - 1))).toBe(false);
        expect(token.isExpired(LATER)).toBe(true);
    });
});
