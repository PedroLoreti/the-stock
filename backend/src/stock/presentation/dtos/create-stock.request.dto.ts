import { IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateStockRequestDTO {
  @IsNotEmpty({ message: 'Name is required' })
  name: string;

  @IsString({ message: 'Description must be a string' })
  description: string;

  @IsNumber(undefined, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be a positive number' })
  quantity: number;

  @IsNumber(undefined, { message: 'Code must be a number' })
  code: number;
}
