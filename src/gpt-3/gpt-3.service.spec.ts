import { Test, TestingModule } from '@nestjs/testing';
import { Gpt3Service } from './gpt-3.service';

describe('Gpt3Service', () => {
  let service: Gpt3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Gpt3Service],
    }).compile();

    service = module.get<Gpt3Service>(Gpt3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
