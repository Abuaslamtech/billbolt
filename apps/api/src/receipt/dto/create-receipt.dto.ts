import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ValidateNested,
  IsNumber,
  IsInt,
  Min,
  IsIn,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export const PAYMENT_METHODS = [
  'Cash', 'Transfer', 'Card', 'Credit', 'Other'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_STATUSES = ['paid', 'unpaid', 'partially_paid'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

class ReceiptItemDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  productId: string;

  @IsInt()
  @Min(1)
  qty: number;
}

export class CreateReceiptDto {
  @IsOptional()
  @IsString()
  @MaxLength(50)
  receiptNumber?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  customerName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  customerPhone?: string;

  @IsArray()
  @ArrayNotEmpty({ message: 'Receipt must contain at least one item' })
  @ValidateNested({ each: true })
  @Type(() => ReceiptItemDto)
  items: ReceiptItemDto[];

  @IsOptional()
  @IsIn(PAYMENT_METHODS)
  paymentMethod?: PaymentMethod;

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

export class RecordRepaymentDto {
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