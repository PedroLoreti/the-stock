import { UnitOfWork } from '../../src/shared/application/unit-of-work.js';
import { Snapshotable } from './snapshotable.js';

/**
 * Simula a transação: se `work` lançar, todos os repositórios voltam ao estado anterior.
 */
export class InMemoryUnitOfWork implements UnitOfWork {
    private readonly stores: Snapshotable[];
    runs = 0;

    constructor(...stores: Snapshotable[]) {
        this.stores = stores;
    }

    async run<T>(work: () => Promise<T>): Promise<T> {
        this.runs++;
        const snapshots = this.stores.map((store) => store.snapshot());
        try {
            return await work();
        } catch (error) {
            this.stores.forEach((store, index) => store.restore(snapshots[index]));
            throw error;
        }
    }
}
