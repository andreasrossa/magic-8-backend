import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiQuery } from '@nestjs/swagger';
import { Engine } from 'openai';
import { OracleQuestionRequest } from './app.dto';
import { CompletionPromptService } from './gpt-3/completion-prompt/completion-prompt.service';
import { Gpt3Service } from './gpt-3/gpt-3.service';
import { RevAiService } from './rev-ai/rev-ai.service';

@Controller()
export class AppController {
  constructor(
    private readonly gpt3Service: Gpt3Service,
    private readonly promptService: CompletionPromptService,
    private readonly revAiService: RevAiService,
  ) {}

  @Get()
  async getHello(): Promise<Engine[]> {
    const r = await this.gpt3Service.getEngines();
    return r ?? [];
  }

  @Get('inspiration')
  async testOpenAI() {
    const q = `
    He asked the wise philosopher: "Can you give me a motivational quote?".
    She replied: "`;
    const r = await this.gpt3Service.getCompletion(q, 'text-curie-001', {
      ...Gpt3Service.defaultCompletionOptions,
      temperature: 1.0,
      max_tokens: 300,
      frequency_penalty: 0.5,
    });

    const a = r.choices?.[0];
    if (!a?.text) return 'Response was null!';

    if (a.text.includes('"')) {
      return a.text.substring(0, a.text.indexOf('"')).trim();
    }

    return a.text.trim();
  }

  @Post('oracle')
  @ApiQuery({
    name: 'template',
    required: false,
    enum: ['sarcastic', 'jokingly'],
  })
  async askOracle(
    @Body() body: OracleQuestionRequest,
    @Param('template') template = 'sarcastic',
  ): Promise<string> {
    const q = this.promptService.getPrompt(template, {
      question: body.question,
    });

    const r = await this.gpt3Service.getCompletion(
      `${q}${body.question}`,
      'text-davinci-001',
      {
        temperature: 0.9,
        max_tokens: 64,
      },
    );

    const a = r.choices?.[0]?.text;

    if (!a) {
      throw new Error('No response from openai');
    }

    if (a.includes('"') && !a.startsWith('"')) {
      return `"${a.substring(0, a.indexOf('"')).trim()}"`;
    }

    return `"${a.trim()}"`;
  }

  @Get('prompts')
  getPrompts(): Record<string, string> {
    return this.promptService.getPromptObject();
  }

  @Get('transcribe')
  getTranscription(): any {
    this.revAiService.transcribeFile();
    return 'cool';
  }
}
