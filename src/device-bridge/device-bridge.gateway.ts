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
import { Duplex, pipeline, Readable } from 'stream';
import { RevAiService } from 'src/rev-ai/rev-ai.service';
@WebSocketGateway(3001, { transports: ['websocket', 'polling'] })
export class DeviceBridgeGateway implements OnGatewayConnection {
  private streams: Record<string, Duplex> = {};
  private timeouts: Record<string, NodeJS.Timeout> = {};

  constructor(
    private logger: DefaultLogger,
    private revAiService: RevAiService,
  ) {}

  handleConnection(client: any, ...args: any[]) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  @SubscribeMessage('start')
  handleStart(@ConnectedSocket() client: Socket) {
    this.logger.log(`Starting stream for ${client.id}`);
    this.streams[client.id] = new Duplex();
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    this.streams[client.id].read = function () {};
    this.streams[client.id].on('data', (data: any) =>
      this.logger.debug(`Received data from stream for ${client.id}`),
    );

    const transcriptionStream = this.revAiService.getTranscriptionStream();

    transcriptionStream.on('error', (e) => this.logger.error(e));
    transcriptionStream.on('data', (data) => this.logger.debug(data));

    pipeline(this.streams[client.id], transcriptionStream, (err) => {
      if (err) {
        this.logger.error(err);
      } else {
        this.logger.debug('Pipeline finished');
      }
    });

    this.timeouts[client.id] = setTimeout(() => {
      this.quitStream(client.id);
    }, 10000);

    this.logger.debug('Starting stream for client ' + client.id);
  }

  @SubscribeMessage('audio_packet')
  handleAudioPacket(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: any,
  ) {
    this.logger.debug(`received data from ${client.id}`);
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
    this.logger.debug('Quitting stream for client ' + clientId);
    if (this.timeouts[clientId]) {
      clearTimeout(this.timeouts[clientId]);
      delete this.timeouts[clientId];
    }

    if (this.streams[clientId] === undefined) {
      throw new Error('Stream doesnt exist.');
    }

    this.streams[clientId].emit('close');
  }
}
