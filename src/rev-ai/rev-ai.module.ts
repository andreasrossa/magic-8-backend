import { Module } from '@nestjs/common';
import { RevAiService } from './rev-ai.service';

@Module({
  providers: [RevAiService],
  exports: [RevAiService],
})
export class RevAiModule {}
