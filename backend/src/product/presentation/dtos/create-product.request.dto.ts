import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateProductRequestDto {
    @IsString()
    @IsNotEmpty({ message: 'Name is required' })
    name: string;

    @IsString({ message: 'Description must be a string' })
    description: string;

    @IsString()
    @IsNotEmpty({ message: 'SKU is required' })
    sku: string;

    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with up to 2 decimal places' })
    @IsPositive({ message: 'Price must be greater than zero' })
    price: number;

    @IsInt({ message: 'Quantity must be an integer' })
    @Min(0, { message: 'Quantity cannot be negative' })
    quantity: number;

    /** Limite para o aviso de estoque baixo. Zero (padrão) só avisa quando esgotar. */
    @IsOptional()
    @IsInt({ message: 'Minimum stock must be an integer' })
    @Min(0, { message: 'Minimum stock cannot be negative' })
    minStock?: number;
}
