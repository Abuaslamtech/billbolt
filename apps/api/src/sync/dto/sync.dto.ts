import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  PAYMENT_METHODS,
  PaymentMethod,
} from 'src/receipt/dto/create-receipt.dto';

export class SyncProductItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clientTempId: string;

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

export class SyncRestockItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clientTempId: string;

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

export class SyncReceiptItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productId: string;

  @IsInt()
  @Min(1)
  qty: number;
}

export class SyncReceiptDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  receiptNumber: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  customerPhone?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncReceiptItemDto)
  items: SyncReceiptItemDto[];

  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsString()
  paymentStatus?: 'paid' | 'unpaid' | 'partially_paid';

  @IsOptional()
  @IsNumber()
  @Min(0)
  amountPaid?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  balanceOwed?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  depositAmount?: number;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  dueDate?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  soldBy?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;

  @IsString()
  @IsNotEmpty({ message: 'Transaction date is required' })
  @MaxLength(50)
  date: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount?: number;
}

export class SyncRepaymentItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  clientTempId: string;

  @IsOptional()
  @IsString()
  receiptId?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  customerPhone: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @IsNumber()
  @Min(1)
  amount: number;

  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  paymentMethod?: PaymentMethod;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class SyncBatchDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncProductItemDto)
  products?: SyncProductItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncRestockItemDto)
  restocks?: SyncRestockItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncReceiptDto)
  receipts?: SyncReceiptDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SyncRepaymentItemDto)
  repayments?: SyncRepaymentItemDto[];
}

