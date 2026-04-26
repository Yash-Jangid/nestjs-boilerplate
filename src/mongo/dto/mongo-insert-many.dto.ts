import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsObject,
  IsString,
} from 'class-validator';

export class MongoInsertManyDto {
  @ApiProperty({ example: 'workflow_leads' })
  @IsString()
  collection: string;

  @ApiProperty({
    type: [Object],
    description: 'Documents to insert (max 200)',
    example: [
      { name: 'Alice', email: 'alice@example.com' },
      { name: 'Bob', email: 'bob@example.com' },
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(200)
  @IsObject({ each: true })
  documents: Record<string, unknown>[];
}
