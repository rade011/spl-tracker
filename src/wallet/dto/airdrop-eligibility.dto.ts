// src/wallet/dto/airdrop-eligibility.dto.ts

import { IsUUID, IsString, IsBoolean, IsNumber } from "class-validator";

export class AirdropEligibilityDto {
  @IsUUID()
  owner: string;

  @IsString()
  address: string;

  @IsNumber()
  balance: number;

  @IsBoolean()
  eligible: boolean;
}
