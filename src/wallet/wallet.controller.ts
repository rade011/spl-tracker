import { Controller, Get, Logger, Param, Query } from "@nestjs/common";
import { WalletService } from "./wallet.service";

@Controller()
export class WalletController {
  private readonly logger = new Logger(WalletService.name);
  constructor(private readonly walletService: WalletService) {}

  @Get("/wallets")
  async getAllWallets() {
    return await this.walletService.getAllWallets();
  }

  @Get("/balance/:owner")
  async getWallet(
    @Param("owner") owner: string,
  ) {
    return await this.walletService.getWallet(owner);
  }

  @Get("/balance")
  async getBalance(owner: string) {
    this.logger.log(`Fetching balance for ${owner}`);
    const wallets = await this.walletService.getAllAccounts()
    return await this.walletService.processAndStoreWallets(wallets);
  }
}
