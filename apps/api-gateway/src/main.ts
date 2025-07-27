import { NestFactory } from '@nestjs/core';
import { ApiGatewayModule } from './api-gateway.module';

declare const module: any;

async function bootstrap() {
  const app = await NestFactory.create(ApiGatewayModule);

  app.enableCors();

  await app.listen(process.env.PORT ?? 3000);

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }
}

void bootstrap();
