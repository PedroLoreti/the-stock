import { IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class UpdateProductRequestDto {
    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Name cannot be empty' })
    name?: string;

    @IsOptional()
    @IsString()
    @IsNotEmpty({ message: 'Brand cannot be empty' })
    brand?: string;

    @IsOptional()
    @IsString({ message: 'Description must be a string' })
    description?: string;

    @IsOptional()
    @IsNumber({ maxDecimalPlaces: 2 }, { message: 'Price must be a number with up to 2 decimal places' })
    @IsPositive({ message: 'Price must be greater than zero' })
    price?: number;

    @IsOptional()
    @IsInt({ message: 'Minimum stock must be an integer' })
    @Min(0, { message: 'Minimum stock cannot be negative' })
    minStock?: number;
}
