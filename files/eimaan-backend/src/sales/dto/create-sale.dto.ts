import { IsDateString, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSaleDto {
  @IsDateString()
  date: string;

  @IsString()
  product: string; // product name

  @IsInt()
  @Min(1)
  qty: number;

  @IsOptional()
  @IsString()
  soldBy?: string;
}
