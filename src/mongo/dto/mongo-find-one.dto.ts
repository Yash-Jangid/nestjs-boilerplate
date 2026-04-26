import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class MongoFindOneDto {
  @ApiProperty({ example: 'workflow_leads' })
  @IsString()
  collection: string;

  @ApiPropertyOptional({
    type: Object,
    example: { jobId: '4402165492' },
    description: 'MongoDB filter expression',
  })
  @IsOptional()
  @IsObject()
  filter?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: Object,
    example: { name: 1, email: 1, _id: 0 },
  })
  @IsOptional()
  @IsObject()
  projection?: Record<string, unknown>;
}
