import * as dotenv from "dotenv";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";



dotenv.config();

export const generateDataSource = async (params?: {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
}): Promise<DataSource> => {
  const configService = new ConfigService();
  const host = params?.host || configService.get<string>("DB_HOST", "localhost");
  const port = params?.port || parseInt(configService.get<string>("DB_PORT") || "5432", 10);
  const username = params?.username || configService.get<string>("DB_USER");
  const password = params?.password || configService.get<string>("DB_PASS");
  const database = params?.database || configService.get<string>("DB_NAME");

  return new DataSource({
    type: "postgres",
    host,
    port,
    username,
    password,
    database,
    synchronize: configService.get<string>("DB_SYNC") === "true",
    logging: configService.get<string>("DB_LOGGING") === "true",
    entities: [],
    migrations: ["dist/migrations/*.js"],
    subscribers: [],
  });
};
