import { randomUUID } from 'node:crypto';
import { InvalidStockError } from '../errors/invalid-stock.error.js';
import { InsufficientStockError } from '../errors/insufficient-stock.error.js';

export interface StockProps {
    id: string;
    name: string;
    description: string;
    quantity: number;
    code: number;
}

export type CreateStockProps = Omit<StockProps, 'id'>;
export type UpdateStockProps = Partial<Pick<StockProps, 'name' | 'description'>>;

export class Stock {
    private constructor(private props: StockProps) {}

    static create(data: CreateStockProps): Stock {
        Stock.validateName(data.name);
        if (data.quantity < 0) {
            throw new InvalidStockError('Quantity cannot be negative');
        }
        return new Stock({ id: randomUUID(), ...data });
    }

    static restore(props: StockProps): Stock {
        return new Stock(props);
    }

    update(data: UpdateStockProps): void {
        if (data.name !== undefined) {
            Stock.validateName(data.name);
            this.props.name = data.name;
        }
        if (data.description !== undefined) {
            this.props.description = data.description;
        }
    }

    addQuantity(amount: number): void {
        Stock.validateAmount(amount);
        this.props.quantity += amount;
    }

    removeQuantity(amount: number): void {
        Stock.validateAmount(amount);
        if (amount > this.props.quantity) {
            throw new InsufficientStockError();
        }
        this.props.quantity -= amount;
    }

    get id() {
        return this.props.id;
    }
    get name() {
        return this.props.name;
    }
    get description() {
        return this.props.description;
    }
    get quantity() {
        return this.props.quantity;
    }
    get code() {
        return this.props.code;
    }

    private static validateName(name: string): void {
        if (!name?.trim()) {
            throw new InvalidStockError('Name is required');
        }
    }

    private static validateAmount(amount: number): void {
        if (amount <= 0) {
            throw new InvalidStockError('Amount must be greater than zero');
        }
    }
}
