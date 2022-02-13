import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import * as fs from 'fs';
import { DefaultLogger } from 'src/logger/default-logger';
import { Socket } from 'socket.io';
import { Stream } from 'stream';
import { GoogleSpeechService } from 'src/google-speech/google-speech.service';
@WebSocketGateway(3001, { transports: ['websocket', 'polling'] })
export class DeviceBridgeGateway implements OnGatewayConnection {
  private streams: Record<string, Stream> = {};
  private timeouts: Record<string, NodeJS.Timeout> = {};

  constructor(
    private logger: DefaultLogger,
    private speechService: GoogleSpeechService,
  ) {}

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('start')
  handleStart(@ConnectedSocket() client: Socket) {
    this.logger.log(`Starting stream for ${client.id}`);
    this.streams[client.id] = new Stream();

    this.logger.debug('Starting stream for client ' + client.id);

    const transcriptionStream = this.speechService.transcribe();

    this.streams[client.id]
      .addListener('data', (data) => console.log(data))
      .pipe(transcriptionStream, { end: true });
  }

  @SubscribeMessage('audio_packet')
  handleAudioPacket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    if (this.streams[client.id] === undefined) {
      throw new Error('Not initialized');
    }

    this.streams[client.id].emit('data', data);

    if (this.timeouts[client.id]) {
      clearTimeout(this.timeouts[client.id]);
    }

    const timeout = setTimeout(() => {
      this.logger.debug(
        'Stream timeout, closing stream for client ' + client.id,
      );
      this.quitStream(client.id);
    }, 5000);

    this.timeouts[client.id] = timeout;
  }

  @SubscribeMessage('stop')
  handleEnd(@ConnectedSocket() client: Socket) {
    if (this.streams[client.id] === undefined) {
      throw new Error('Stream doesnt exist.');
    }

    this.logger.log(`Stopping stream for ${client.id}`);

    this.quitStream(client.id);
  }

  private quitStream(clientId: string) {
    if (this.streams[clientId] === undefined) {
      throw new Error('Stream doesnt exist.');
    }

    this.streams[clientId].emit('close');
  }
}
