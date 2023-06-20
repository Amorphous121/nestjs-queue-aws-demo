import { Controller, Get } from '@nestjs/common';

@Controller('hello')
export class AppController {
  @Get()
  sayHello() {
    return 'Hello From NestJs';
  }
}
