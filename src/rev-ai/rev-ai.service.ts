import { Injectable } from '@nestjs/common';
import { DefaultLogger } from 'src/logger/default-logger';
import * as revai from 'revai-node-sdk';
import { ConfigService } from '@nestjs/config';
import { createReadStream } from 'fs';
import { join } from 'path';
import { RevAiStreamingClient } from 'revai-node-sdk';
import { Duplex } from 'stream';

export type AudioConfigType = Omit<revai.AudioConfig, 'getContentTypeString'>;

@Injectable()
export class RevAiService {
  constructor(
    private logger: DefaultLogger,
    private configService: ConfigService,
  ) {}

  static defaultAudioConfig: AudioConfigType = {
    contentType: 'audio/x-wav',
    channels: 1,
    rate: 16000,
  };

  private getClient(configOverride?: Partial<revai.AudioConfig>) {
    const config = {
      ...RevAiService.defaultAudioConfig,
      ...configOverride,
    };

    const client = new revai.RevAiStreamingClient(
      this.configService.get('REVAI_API_KEY'),
      new revai.AudioConfig(
        config.contentType,
        config.layout,
        config.rate,
        config.format,
        config.channels,
      ),
    );

    return this.attachLoggingHandlers(client);
  }

  private attachLoggingHandlers(client: RevAiStreamingClient) {
    client.on('close', (code, reason) => {
      this.logger.debug(`Connection closed, ${code}: ${reason}`);
    });
    client.on('httpResponse', (code) => {
      this.logger.debug(
        `Streaming client received http response with code: ${code}`,
      );
    });
    client.on('connectFailed', (error) => {
      this.logger.debug(`Connection failed with error: ${error}`);
    });
    client.on('connect', (connectionMessage) => {
      this.logger.debug(`Connected with message: ${connectionMessage}`);
    });

    return client;
  }

  transcribeFile() {
    const client = this.getClient();
    const filePath = join(__dirname, '../assets/audio.wav');

    const stream = client.start();
    stream.on('data', (d: revai.StreamingHypothesis) => {
      if (d.type === 'final') {
        this.logger.debug(d.elements.map((it) => it.value).join(''));
      }
    });
    stream.on('end', () => this.logger.debug('Stream ended'));
    stream.on('error', (e) => this.logger.error(e));

    const file = createReadStream(filePath);
    file.on('end', () => {
      client.end();
    });

    file.on('data', () => this.logger.debug('Reading file...'));

    file.pipe(stream);
  }

  getTranscriptionStream(options?: Partial<AudioConfigType>): Duplex {
    const client = this.getClient(options);
    return client.start();
  }
}
