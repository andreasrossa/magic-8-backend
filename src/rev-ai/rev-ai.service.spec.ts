import { Test, TestingModule } from '@nestjs/testing';
import { RevAiService } from './rev-ai.service';

describe('RevAiService', () => {
  let service: RevAiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RevAiService],
    }).compile();

    service = module.get<RevAiService>(RevAiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
