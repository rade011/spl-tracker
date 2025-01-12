// src/ormconfig.ts

import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";


dotenv.config();

const ormConfig: PostgresConnectionOptions = {
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME || "spl_tracker", // **Add this line**
  logging: true,
  entities: ["dist/**/*.entity.js"],
  migrations: ["dist/src/migrations/*.js"],
  synchronize: false,
};

export default new DataSource(ormConfig);
