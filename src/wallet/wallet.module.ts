import { Module } from "@nestjs/common";
import { WalletService } from "./wallet.service";
import { WalletController } from "./wallet.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { WalletState } from "../entities/wallet-state.entity";
import { BalanceEntriesEntity } from "../entities/balance-entries.entity";
import { HeliusClient } from "../common/clients/helius.client";

@Module({
  imports: [TypeOrmModule.forFeature([WalletState, BalanceEntriesEntity])],
  controllers: [WalletController],
  providers: [WalletService, HeliusClient],
  exports: [WalletService],
})
export class WalletModule {}
