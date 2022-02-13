import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DefaultLogger } from 'src/logger/default-logger';
import {
  Configuration,
  CreateCompletionResponse,
  Engine,
  ListEnginesResponse,
  OpenAIApi,
} from 'openai';

export type Gpt3CompletionOptions = {
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
};

export type Gpt3Engines = 'text-davinci-001' | 'text-curie-001';

@Injectable()
export class Gpt3Service {
  private config: Configuration;
  private openai: OpenAIApi;

  constructor(
    private configService: ConfigService,
    private logger: DefaultLogger,
  ) {
    this.config = new Configuration({
      organization: this.configService.get('OPENAPI_ORGANIZATION'),
      apiKey: this.configService.get('OPENAPI_API_KEY'),
    });

    logger.debug(JSON.stringify(this.config));

    this.openai = new OpenAIApi(this.config);
  }

  async getEngines(): Promise<Engine[] | undefined> {
    let r: ListEnginesResponse;

    try {
      r = (await this.openai.listEngines()).data;
    } catch (e) {
      this.logger.error(JSON.stringify(e));
    }

    return r.data;
  }

  async getCompletion(
    prompt: string,
    engine: Gpt3Engines = 'text-davinci-001',
    optionsOverride?: Partial<Gpt3CompletionOptions>,
  ): Promise<CreateCompletionResponse> {
    const r = await this.openai.createCompletion(engine, {
      ...Gpt3Service.defaultCompletionOptions,
      ...(optionsOverride ?? {}),
      prompt,
    });

    return r.data;
  }

  static defaultCompletionOptions: Gpt3CompletionOptions = {
    temperature: 0.7,
    max_tokens: 64,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  };
}
