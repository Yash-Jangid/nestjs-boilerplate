import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsString } from 'class-validator';

export class MongoInsertOneDto {
  @ApiProperty({ example: 'workflow_leads' })
  @IsString()
  collection: string;

  @ApiProperty({
    type: Object,
    example: { name: 'John Doe', email: 'john@example.com', status: 'new' },
    description: 'Document to insert',
  })
  @IsObject()
  document: Record<string, unknown>;
}
