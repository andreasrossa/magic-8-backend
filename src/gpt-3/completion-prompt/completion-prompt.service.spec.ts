import { Test, TestingModule } from '@nestjs/testing';
import { CompletionPromptService } from './completion-prompt.service';

describe('CompletionPromptService', () => {
  let service: CompletionPromptService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CompletionPromptService],
    }).compile();

    service = module.get<CompletionPromptService>(CompletionPromptService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
