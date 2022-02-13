import { Module } from '@nestjs/common';
import { GoogleSpeechModule } from 'src/google-speech/google-speech.module';
import { LoggerModule } from 'src/logger/logger.module';
import { DeviceBridgeGateway } from './device-bridge.gateway';

@Module({
  providers: [DeviceBridgeGateway],
  imports: [GoogleSpeechModule],
})
export class DeviceBridgeModule {}
