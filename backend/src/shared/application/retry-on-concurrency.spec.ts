import { ConcurrencyError } from '../domain/concurrency.error.js';
import { retryOnConcurrency } from './retry-on-concurrency.js';

describe('retryOnConcurrency', () => {
    it('returns the result when the work succeeds on the first try', async () => {
        const work = vi.fn().mockResolvedValue('ok');

        await expect(retryOnConcurrency(work)).resolves.toBe('ok');
        expect(work).toHaveBeenCalledTimes(1);
    });

    it('retries after a ConcurrencyError and returns the later result', async () => {
        const work = vi.fn().mockRejectedValueOnce(new ConcurrencyError()).mockResolvedValue('ok');

        await expect(retryOnConcurrency(work)).resolves.toBe('ok');
        expect(work).toHaveBeenCalledTimes(2);
    });

    it('gives up after the configured number of attempts', async () => {
        const work = vi.fn().mockRejectedValue(new ConcurrencyError());

        await expect(retryOnConcurrency(work, 3)).rejects.toBeInstanceOf(ConcurrencyError);
        expect(work).toHaveBeenCalledTimes(3);
    });

    it('does not retry other errors', async () => {
        const work = vi.fn().mockRejectedValue(new Error('boom'));

        await expect(retryOnConcurrency(work)).rejects.toThrow('boom');
        expect(work).toHaveBeenCalledTimes(1);
    });
});
