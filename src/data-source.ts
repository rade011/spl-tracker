// src/data-source.ts

import { DataSource } from "typeorm";
import { WalletState } from "./entities/wallet-state.entity";
import { BalanceEntriesEntity } from "./entities/balance-entries.entity";
// Import other entities as needed

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT as string, 10) || 5432,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  synchronize: process.env.DB_SYNC === "true", // Note: set to false in production
  logging: process.env.DB_LOGGING === "true",
  entities: [WalletState, BalanceEntriesEntity],
  migrations: ["dist/src/migrations/*.js"], // Adjust the path as needed
  subscribers: [],
});
