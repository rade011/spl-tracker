// src/common/common.module.ts

import { Global, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
// or any other logging module you prefer
import { TypeOrmModule } from "@nestjs/typeorm";
// or whichever DB approach you're using
import { HeliusClient } from "./clients/helius.client";
import { SplAppConfigService } from "./app-config/app-config.service";
import { DataSource, DataSourceOptions } from "typeorm";
import { HttpModule } from "@nestjs/axios";

// Example "in-memory" DB config, if you need it for tests/dev
// (You might not need this if you’re using a real Postgres or MySQL)
export const inMemoryDBConfig = {
  type: "better-sqlite3",
  database: ":memory:",
  dropSchema: true,
  synchronize: true,
  entities: ["dist/**/*.entity.js"],
  logger: "advanced-console",
  logging: false,
};

@Global() // This module is globally available
@Module({
  imports: [
    // Makes environment-based config global
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // Example: TypeORM config if you're using a relational DB
    TypeOrmModule.forRootAsync({
      imports: [CommonModule],
      inject: [SplAppConfigService],
      useFactory: async (appConfigService: SplAppConfigService) => {
        return process.env.CLIENT_SPEC_PATH ? inMemoryDBConfig : appConfigService.config.database;
      },
    }),
    HttpModule, // Make the HTTP module available everywhere
  ],
  providers: [
    SplAppConfigService,
    HeliusClient, // a custom client for Helius or Solana RPC
    // ... other globally shared services
  ],
  exports: [
    SplAppConfigService,
    HeliusClient,
    HttpModule, // make the HTTP module available everywhere
    // ... export other services so they're available everywhere
  ],
})
export class CommonModule {}
