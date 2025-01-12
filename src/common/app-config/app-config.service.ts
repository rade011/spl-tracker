// src/common/app-config.service.ts
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface SplAppConfig {
  database: any; // or a typed DB config object
  helio: {
    apiKey: string;
  };
  logger: {
    level: string;
    // ... any other logger options you want
  };
  // ... add more sections as needed
  service: {
    port: number;
  };
}

@Injectable()
export class SplAppConfigService {
  config: SplAppConfig;

  constructor(private readonly configService: ConfigService) {
    // Build your typed config object
    this.config = {
      database: {
        type: this.configService.get<string>("DB_TYPE", "postgres"), // Ensure this is 'postgres'
        host: this.configService.get<string>("DB_HOST", "localhost"),
        port: parseInt(this.configService.get<string>("DB_PORT") || "5432", 10),
        username: this.configService.get<string>("DB_USER"),
        password: this.configService.get<string>("DB_PASS"),
        database: this.configService.get<string>("DB_NAME"),
        synchronize: this.configService.get<string>("DB_SYNC") === "true",
        autoLoadEntities: true,
        logging: this.configService.get<string>("DB_LOGGING") === "true",
        migrations: ["dist/migrations/*.js"],
        cli: {
          migrationsDir: "src/migrations",
        },
      },
      helio: {
        apiKey: this.configService.get<string>("HELIUS_API_KEY", ""),
      },
      logger: {
        level: this.configService.get<string>("LOGGER_LEVEL", "debug"),
        // add more logger fields if needed
      },
      service: {
        port: parseInt(this.configService.get<string>("PORT") || "3775", 10),
      }
    };
  }
}
