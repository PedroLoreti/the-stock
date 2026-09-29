import { randomUUID } from 'node:crypto';
import { roundMoney } from '../../../shared/domain/money.js';
import { InvalidSaleError } from '../errors/invalid-sale.error.js';

export interface SaleItemProps {
    id: string;
    productId: string;
    quantity: number;
    unitPrice: number;
}

export type CreateSaleItemProps = Omit<SaleItemProps, 'id'>;

export class SaleItem {
    private constructor(private props: SaleItemProps) {}

    static create(data: CreateSaleItemProps): SaleItem {
        if (data.quantity <= 0) {
            throw new InvalidSaleError('Item quantity must be greater than zero');
        }
        if (data.unitPrice < 0) {
            throw new InvalidSaleError('Item unit price cannot be negative');
        }
        return new SaleItem({ id: randomUUID(), ...data });
    }

    static restore(props: SaleItemProps): SaleItem {
        return new SaleItem(props);
    }

    get id() {
        return this.props.id;
    }
    get productId() {
        return this.props.productId;
    }
    get quantity() {
        return this.props.quantity;
    }
    get unitPrice() {
        return this.props.unitPrice;
    }
    get subtotal() {
        return roundMoney(this.props.quantity * this.props.unitPrice);
    }
}
