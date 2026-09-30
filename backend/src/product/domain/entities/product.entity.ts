import { randomUUID } from 'node:crypto';
import { InvalidProductError } from '../errors/invalid-product.error.js';
import { InsufficientStockError } from '../errors/insufficient-stock.error.js';
import { ProductInactiveError } from '../errors/product-inactive.error.js';

export interface ProductProps {
    id: string;
    name: string;
    description: string;
    sku: string;
    price: number;
    quantity: number;
    active: boolean;
    /** Contador de gravações, usado pelo lock otimista no repositório. */
    version: number;
}

export type CreateProductProps = Omit<ProductProps, 'id' | 'active' | 'version'>;
export type UpdateProductProps = Partial<Pick<ProductProps, 'name' | 'description' | 'price'>>;

const SKU_PATTERN = /^TS-\d+$/;

export class Product {
    private constructor(private props: ProductProps) {}

    static create(data: CreateProductProps): Product {
        Product.validateName(data.name);
        Product.validateSku(data.sku);
        Product.validatePrice(data.price);
        if (data.quantity < 0) {
            throw new InvalidProductError('Quantity cannot be negative');
        }

        return new Product({
            id: randomUUID(),
            ...data,
            sku: data.sku.trim(),
            active: true,
            version: 0,
        });
    }

    static restore(props: ProductProps): Product {
        return new Product(props);
    }

    update(data: UpdateProductProps): void {
        if (data.name !== undefined) {
            Product.validateName(data.name);
            this.props.name = data.name;
        }
        if (data.description !== undefined) {
            this.props.description = data.description;
        }
        if (data.price !== undefined) {
            Product.validatePrice(data.price);
            this.props.price = data.price;
        }
    }

    addQuantity(amount: number): void {
        this.ensureActive();
        Product.validateAmount(amount);
        this.props.quantity += amount;
    }

    removeQuantity(amount: number): void {
        this.ensureActive();
        Product.validateAmount(amount);
        if (amount > this.props.quantity) {
            throw new InsufficientStockError();
        }
        this.props.quantity -= amount;
    }

    deactivate(): void {
        this.props.active = false;
    }

    activate(): void {
        this.props.active = true;
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
    get sku() {
        return this.props.sku;
    }
    get price() {
        return this.props.price;
    }
    get quantity() {
        return this.props.quantity;
    }
    get active() {
        return this.props.active;
    }
    get version() {
        return this.props.version;
    }

    private ensureActive(): void {
        if (!this.props.active) {
            throw new ProductInactiveError();
        }
    }

    private static validateName(name: string): void {
        if (!name?.trim()) {
            throw new InvalidProductError('Name is required');
        }
    }

    private static validateSku(sku: string): void {
        if (!SKU_PATTERN.test(sku?.trim())) {
            throw new InvalidProductError('SKU must follow the format TS-<number> (e.g. TS-1)');
        }
    }

    private static validatePrice(price: number): void {
        if (price <= 0) {
            throw new InvalidProductError('Price must be greater than zero');
        }
    }

    private static validateAmount(amount: number): void {
        if (amount <= 0) {
            throw new InvalidProductError('Amount must be greater than zero');
        }
    }
}
