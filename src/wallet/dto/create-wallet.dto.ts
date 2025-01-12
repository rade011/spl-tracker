// src/wallet/dto/create-wallet.dto.ts

import { IsUUID, IsString, IsOptional } from "class-validator";

export class CreateWalletDto {
  @IsUUID()
  owner: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  description?: string; // Optional field for additional info
}
