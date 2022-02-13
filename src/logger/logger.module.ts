import { Global, Module } from '@nestjs/common';
import { DefaultLogger } from './default-logger';

@Global()
@Module({
  providers: [DefaultLogger],
  exports: [DefaultLogger],
})
export class LoggerModule {}
