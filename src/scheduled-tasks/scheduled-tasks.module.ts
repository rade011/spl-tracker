// src/scheduled-tasks/scheduled-tasks.module.ts

import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduledTasksService } from './scheduled-tasks.service';
import { WalletModule } from '../wallet/wallet.module';

@Module({
  imports: [
    ScheduleModule.forRoot(), // Initialize ScheduleModule
    WalletModule, // Import WalletModule to access WalletService
  ],
  providers: [ScheduledTasksService],
})
export class ScheduledTasksModule {}
