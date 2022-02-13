import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DeviceBridgeModule } from './device-bridge/device-bridge.module';
import { LoggerModule } from './logger/logger.module';
import { Gpt3Module } from './gpt-3/gpt-3.module';
import { ConfigModule } from '@nestjs/config';
import { GoogleSpeechModule } from './google-speech/google-speech.module';
import config from './config/configuration';

@Module({
  imports: [
    LoggerModule,
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    DeviceBridgeModule,
    Gpt3Module,
    GoogleSpeechModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
