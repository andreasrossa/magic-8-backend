import { Injectable } from '@nestjs/common';
import { SpeechClient } from '@google-cloud/speech';
import { DefaultLogger } from 'src/logger/default-logger';
import { GoogleAuth } from 'google-auth-library';

type RecognitionStreamConfig = Parameters<
  SpeechClient['streamingRecognize']
>[0];

@Injectable()
export class GoogleSpeechService {
  private client: SpeechClient;

  constructor(private logger: DefaultLogger) {
    this.client = new SpeechClient({
      auth: new GoogleAuth({
        keyFile: './google-key.json',
      }),
    });
  }

  transcribe(options: Partial<typeof GoogleSpeechService.defaultConfig> = {}) {
    return this.client
      .streamingRecognize({
        ...GoogleSpeechService.defaultConfig,
        ...options,
      })
      .on('error', console.error)
      .on('data', (data) =>
        console.log(
          `Transcription: ${data.results[0].alternatives[0].transcript}`,
        ),
      );
  }

  static defaultConfig: RecognitionStreamConfig = {
    config: {
      encoding: 'LINEAR16',
      sampleRateHertz: 16000,
      languageCode: 'en-US',
    },
    interimResults: false,
  };
}
