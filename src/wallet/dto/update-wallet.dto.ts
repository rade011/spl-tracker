// src/wallet/dto/update-wallet.dto.ts

import { IsString, IsOptional, IsNumber } from "class-validator";

export class UpdateWalletDto {
  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsNumber()
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
