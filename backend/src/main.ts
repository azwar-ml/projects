import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS so your Next.js app (on 3001) can talk to this backend
  app.enableCors(); 

  // CHANGE THIS FROM 3001 TO 3000
  await app.listen(3000); 
  
  console.log('Backend is running on http://localhost:3000');
}
bootstrap();