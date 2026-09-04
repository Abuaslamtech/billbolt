import { IsDateString, IsInt, IsNumber, IsString, Min } from 'class-validator';

export class CreateRestockDto {
  @IsDateString()
  date: string;

  @IsString()
  product: string;

  @IsInt()
  @Min(1)
  qty: number;

  @IsNumber()
  @Min(0)
  costPerUnit: number;
}
