/** Lê uma variável obrigatória; a aplicação não deve subir sem ela. */
export function requireEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim().length === 0) {
        throw new Error(`Missing required environment variable ${name} (see .env.example)`);
    }
    return value;
}

export function optionalEnv(name: string, fallback: string): string {
    const value = process.env[name];
    return value && value.trim().length > 0 ? value : fallback;
}

const DURATION_PATTERN = /^(\d+)\s*(ms|s|m|h|d)$/i;
const UNIT_MS: Record<string, number> = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };

/** Converte durações como "15m", "8h", "7d" para milissegundos. */
export function parseDurationMs(value: string): number {
    const match = DURATION_PATTERN.exec(value.trim());
    if (!match) {
        throw new Error(`Invalid duration "${value}". Use a number followed by ms, s, m, h or d (e.g. 15m, 7d)`);
    }
    return Number(match[1]) * UNIT_MS[match[2].toLowerCase()];
}
