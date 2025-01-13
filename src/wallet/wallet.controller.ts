import { Controller, Get, Logger } from "@nestjs/common";
import { WalletService } from "./wallet.service";

@Controller("wallets")
export class WalletController {
  private readonly logger = new Logger(WalletService.name);
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getAllWallets() {
    return await this.walletService.getAllWallets();
  }

  @Get(":owner")
  async getWallet(owner: string) {
    return await this.walletService.getWallet(owner);
  }

  @Get("/balance")
  async getBalance(owner: string) {
    this.logger.log(`Fetching balance for ${owner}`);
    const wallets = await this.walletService.getAllAccounts()
    return await this.walletService.processAndStoreWallets(wallets);
  }
}
