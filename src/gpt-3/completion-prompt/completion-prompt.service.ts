import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';

@Injectable()
export class CompletionPromptService {
  [x: string]: any;
  private prompts: Record<string, string>;

  constructor(private configService: ConfigService) {
    const defaultPrompts = this.configService.get<Record<string, string>>(
      'openai.defaultPrompts',
    );
    this.prompts = defaultPrompts ?? {};
  }

  getPromptObject = (): Record<string, string> => this.prompts;

  getPrompt = <T extends Record<string, string> | undefined = undefined>(
    name: string,
    vars?: T,
  ): string | undefined => {
    const template = Handlebars.compile(this.prompts[name]);
    return template(vars);
  };

  getPromptTemplate = (name: string): Handlebars.TemplateDelegate | undefined =>
    this.prompts[name] !== undefined
      ? Handlebars.compile(this.prompts[name])
      : undefined;

  addPrompt = (name: string, prompt: string): void => {
    this.prompts[name] = prompt;
  };
}
