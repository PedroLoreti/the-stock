/**
 * Executa um bloco de trabalho de forma atômica: ou todas as escritas
 * feitas dentro de `work` são persistidas, ou nenhuma é.
 */
export abstract class UnitOfWork {
    abstract run<T>(work: () => Promise<T>): Promise<T>;
}
