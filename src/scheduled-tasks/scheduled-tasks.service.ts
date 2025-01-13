// src/scheduled-tasks/scheduled-tasks.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WalletService } from '../wallet/wallet.service';

@Injectable()
export class ScheduledTasksService {
  private readonly logger = new Logger(ScheduledTasksService.name);

  constructor(private readonly walletService: WalletService) {}

  /**
   * Cron Job: Runs every 4 hours.
   * Fetches and updates wallet balances from Helius API.
   */
  @Cron("0 0-23/4 * * *")
  async handleDailyWalletUpdate() {
    this.logger.log('Starting daily wallet balance update.');

    try {
      const walletData = await this.walletService.getAllAccounts();
      await this.walletService.processAndStoreWallets(walletData);
      this.logger.log('Daily wallet balance update completed successfully.');
    } catch (error) {
      this.logger.error(`Daily wallet update failed: ${error.message}`, error.stack);
      // Optionally, implement retry logic or alerting here
    }
  }

  /**
   * Cron Job: Runs daily at noon.
   * Additional scheduled tasks can be added here.
   */
  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleNoonTasks() {
    this.logger.log('Starting noon scheduled tasks.');

    try {
      // Implement additional tasks here
      this.logger.log('Noon scheduled tasks completed successfully.');
    } catch (error) {
      this.logger.error(`Noon scheduled tasks failed: ${error.message}`, error.stack);
    }
  }
}
