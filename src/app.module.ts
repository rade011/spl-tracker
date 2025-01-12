import { Module } from "@nestjs/common";
import { CommonModule } from "./common/common.module";
import { WalletModule } from "./wallet/wallet.module";
import { ScheduledTasksModule } from './scheduled-tasks/scheduled-tasks.module';

@Module({
  imports: [CommonModule, WalletModule, ScheduledTasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
