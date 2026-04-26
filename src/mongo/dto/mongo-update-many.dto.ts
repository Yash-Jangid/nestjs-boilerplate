import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class MongoUpdateManyDto {
  @ApiProperty({ example: 'workflow_leads' })
  @IsString()
  collection: string;

  @ApiProperty({
    type: Object,
    example: { status: 'pending' },
    description:
      'Filter to select documents to update. Empty filter {} is rejected.',
  })
  @IsObject()
  filter: Record<string, unknown>;

  @ApiProperty({
    type: Object,
    example: { $set: { status: 'processed' } },
    description: 'Update expression',
  })
  @IsObject()
  update: Record<string, unknown>;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  upsert?: boolean;
}
