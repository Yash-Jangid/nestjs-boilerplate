import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class MongoDeleteOneDto {
  @ApiProperty({ example: 'workflow_leads' })
  @IsString()
  collection: string;

  @ApiProperty({
    type: Object,
    example: { _id: '664abc...' },
    description: 'Filter to select the document to delete',
  })
  @IsObject()
  filter: Record<string, unknown>;
}
