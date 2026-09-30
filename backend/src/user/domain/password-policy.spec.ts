import { InvalidPasswordError } from './errors/invalid-password.error.js';
import { assertValidPassword } from './password-policy.js';

describe('assertValidPassword', () => {
    it.each(['admin123', 'a'.repeat(8), 'a'.repeat(72)])('accepts %j', (password) => {
        expect(() => assertValidPassword(password)).not.toThrow();
    });

    it.each(['', '        ', 'short', 'a'.repeat(73)])('rejects %j', (password) => {
        expect(() => assertValidPassword(password)).toThrow(InvalidPasswordError);
    });
});
