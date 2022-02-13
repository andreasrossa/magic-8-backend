import { Module } from '@nestjs/common';
import { LoggerModule } from 'src/logger/logger.module';
import { RevAiModule } from 'src/rev-ai/rev-ai.module';
import { DeviceBridgeGateway } from './device-bridge.gateway';

@Module({
  providers: [DeviceBridgeGateway],
  imports: [RevAiModule],
})
export class DeviceBridgeModule {}
