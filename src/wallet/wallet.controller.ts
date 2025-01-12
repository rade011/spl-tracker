import { Controller, Get } from "@nestjs/common";
import { WalletService } from "./wallet.service";

@Controller("wallets")
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get()
  async getAllWallets() {
    return await this.walletService.getAllWallets();
  }

  @Get(":owner")
  async getWallet(owner: string) {
    return await this.walletService.getWallet(owner);
  }
}
