/**
 * Arredonda para 2 casas decimais, evitando o erro de ponto flutuante
 * em operações como 3 * 0.1 = 0.30000000000000004.
 */
export function roundMoney(value: number): number {
    return Math.round(value * 100) / 100;
}
