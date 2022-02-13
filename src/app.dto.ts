import { ApiProperty } from '@nestjs/swagger';

export class OracleQuestionRequest {
  @ApiProperty({
    example: 'What is love?',
  })
  question: string;
}
