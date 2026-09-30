import { roundMoney } from './money.js';

describe('roundMoney', () => {
    it.each([
        [0.30000000000000004, 0.3],
        [10.005, 10.01],
        [2.5, 2.5],
        [0, 0],
    ])('rounds %d to %d', (input, expected) => {
        expect(roundMoney(input)).toBe(expected);
    });
});
