import { optionalEnv, parseDurationMs, requireEnv } from './env.js';

describe('env helpers', () => {
    const NAME = 'THE_STOCK_TEST_VAR';

    afterEach(() => {
        delete process.env[NAME];
    });

    it('requireEnv returns the value or throws when missing/blank', () => {
        process.env[NAME] = 'x';
        expect(requireEnv(NAME)).toBe('x');
        process.env[NAME] = '  ';
        expect(() => requireEnv(NAME)).toThrow(/THE_STOCK_TEST_VAR/);
    });

    it('optionalEnv falls back when missing', () => {
        expect(optionalEnv(NAME, 'fallback')).toBe('fallback');
        process.env[NAME] = 'set';
        expect(optionalEnv(NAME, 'fallback')).toBe('set');
    });

    it.each([
        ['500ms', 500],
        ['15m', 900_000],
        ['8h', 28_800_000],
        ['7d', 604_800_000],
    ])('parseDurationMs(%j) = %d', (input, expected) => {
        expect(parseDurationMs(input)).toBe(expected);
    });

    it.each(['', '15', 'm', '1w', 'abc'])('parseDurationMs rejects %j', (input) => {
        expect(() => parseDurationMs(input)).toThrow(/Invalid duration/);
    });
});
