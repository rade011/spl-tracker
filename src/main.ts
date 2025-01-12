import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AppDataSource } from "./data-source";
import { SplAppConfigService } from "./common/app-config/app-config.service";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(SplAppConfigService);
  const port = configService.config.service.port || 3775;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
