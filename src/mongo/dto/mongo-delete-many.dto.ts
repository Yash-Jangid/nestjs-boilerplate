import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class MongoDeleteManyDto {
  @ApiProperty({ example: 'workflow_leads' })
  @IsString()
  collection: string;

  @ApiProperty({
    type: Object,
    example: { status: 'archived' },
    description:
      'Filter to select documents to delete. Empty filter {} is rejected to prevent wiping the collection.',
  })
  @IsObject()
  filter: Record<string, unknown>;
}
