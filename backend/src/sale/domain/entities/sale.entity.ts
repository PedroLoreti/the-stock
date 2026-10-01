import { randomUUID } from 'node:crypto';
import { roundMoney } from '../../../shared/domain/money.js';
import { InvalidSaleError } from '../errors/invalid-sale.error.js';
import { SaleAlreadyCancelledError } from '../errors/sale-already-cancelled.error.js';
import { SaleCancellationWindowExpiredError } from '../errors/sale-cancellation-window-expired.error.js';
import { SaleItem } from './sale-item.entity.js';

export const SaleStatus = {
    COMPLETED: 'COMPLETED',
    CANCELLED: 'CANCELLED',
} as const;
export type SaleStatus = (typeof SaleStatus)[keyof typeof SaleStatus];

export interface SaleProps {
    id: string;
    /** Usuário que registrou a venda. */
    userId: string;
    /** Nome do vendedor, lido do cadastro de usuários (não é um snapshot). */
    userName: string;
    status: SaleStatus;
    items: SaleItem[];
    createdAt: Date;
    cancelledAt: Date | null;
}

export interface CreateSaleProps {
    userId: string;
    userName: string;
    items: SaleItem[];
}

const CANCELLATION_WINDOW_MS = 5 * 60 * 60 * 1000;

export class Sale {
    private constructor(private props: SaleProps) {}

    static create({ userId, userName, items }: CreateSaleProps): Sale {
        if (!userId) {
            throw new InvalidSaleError('Sale must have a user');
        }
        if (items.length === 0) {
            throw new InvalidSaleError('Sale must have at least one item');
        }
        return new Sale({
            id: randomUUID(),
            userId,
            userName,
            status: SaleStatus.COMPLETED,
            items,
            createdAt: new Date(),
            cancelledAt: null,
        });
    }

    static restore(props: SaleProps): Sale {
        return new Sale(props);
    }

    cancel(now: Date): void {
        if (this.props.status === SaleStatus.CANCELLED) {
            throw new SaleAlreadyCancelledError();
        }
        const elapsed = now.getTime() - this.props.createdAt.getTime();
        if (elapsed > CANCELLATION_WINDOW_MS) {
            throw new SaleCancellationWindowExpiredError();
        }
        this.props.status = SaleStatus.CANCELLED;
        this.props.cancelledAt = now;
    }

    get id() {
        return this.props.id;
    }
    get userId() {
        return this.props.userId;
    }
    get userName() {
        return this.props.userName;
    }
    get status() {
        return this.props.status;
    }
    get items(): readonly SaleItem[] {
        return this.props.items;
    }
    get total() {
        return roundMoney(this.props.items.reduce((sum, item) => sum + item.subtotal, 0));
    }
    get createdAt() {
        return this.props.createdAt;
    }
    get cancelledAt() {
        return this.props.cancelledAt;
    }
}
