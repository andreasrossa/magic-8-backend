import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CompletionPromptService } from './completion-prompt/completion-prompt.service';
import { Gpt3Service } from './gpt-3.service';

export type Gpt3ModuleConfig = {
  apiKey: string;
  organization: string;
  defaultPrompts: string[];
};

export enum Gpt3ModuleProviderKeys {
  GPT3_CONFIG = 'GPT3_CONFIG',
}

@Module({
  providers: [Gpt3Service, CompletionPromptService],
  exports: [Gpt3Service, CompletionPromptService],
  imports: [ConfigModule],
})
export class Gpt3Module {}
