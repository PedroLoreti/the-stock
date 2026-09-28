import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { CodeIsUnique } from '../validation/code-is-unique.validator.js';

export class UpdateStockDto {
  @IsNotEmpty({ message: 'Name is required' })
  @IsOptional()
  name: string;

  @IsString({ message: 'Description must be a string' })
  @IsOptional()
  description: string;

  @IsNumber(undefined, { message: 'Quantity must be a number' })
  @Min(1, { message: 'Quantity must be a positive number' })
  @IsOptional()
  quantity: number;

  @IsNumber(undefined, { message: 'Code must be a number' })
  @CodeIsUnique({ message: 'Code must be unique' })
  @IsOptional()
  code: number;
}
