/**
 * Um repositório em memória que sabe tirar uma "foto" do próprio estado e voltar a ela.
 * Usado pelo InMemoryUnitOfWork para simular o rollback de uma transação.
 */
export interface Snapshotable {
    snapshot(): unknown;
    restore(snapshot: unknown): void;
}
