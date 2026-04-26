import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class MongoUpdateOneDto {
  @ApiProperty({ example: 'workflow_leads' })
  @IsString()
  collection: string;

  @ApiProperty({
    type: Object,
    example: { email: 'john@example.com' },
    description: 'Filter to select the document to update',
  })
  @IsObject()
  filter: Record<string, unknown>;

  @ApiProperty({
    type: Object,
    example: { $set: { status: 'processed' } },
    description: 'Update expression (e.g. $set, $inc, $push)',
  })
  @IsObject()
  update: Record<string, unknown>;

  @ApiPropertyOptional({
    example: false,
    description: 'Insert a document if no match found',
  })
  @IsOptional()
  @IsBoolean()
  upsert?: boolean;
}
