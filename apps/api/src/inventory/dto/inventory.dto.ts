import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  Min,
  IsInt,
  MaxLength,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  qrCode?: string;

  @IsNumber()
  @Min(0)
  costPrice: number;

  @IsNumber()
  @Min(0)
  sellingPrice: number;

  @IsInt()
  @Min(0)
  openingStock: number;

  @IsInt()
  @Min(0)
  reorderLevel: number;
}

export class UpdateProductDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  qrCode?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sellingPrice?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  reorderLevel?: number;
}

export class CreateRestockDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productId: string;

  @IsInt()
  @IsPositive()
  qty: number;

  @IsNumber()
  @Min(0)
  costPerUnit: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
