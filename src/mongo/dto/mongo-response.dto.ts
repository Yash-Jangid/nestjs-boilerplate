import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MongoReadMetaDto {
  @ApiProperty({ example: 'workflow_leads' })
  collection: string;

  @ApiProperty({ example: 'find' })
  operation: string;

  @ApiProperty({ example: 42 })
  count: number;

  @ApiProperty({ example: 200 })
  limitEnforced: number;
}

export class MongoReadResponseDto {
  @ApiProperty({ isArray: true, type: Object })
  data: Record<string, unknown>[];

  @ApiProperty({ type: MongoReadMetaDto })
  meta: MongoReadMetaDto;
}

export class MongoInsertOneResponseDto {
  @ApiProperty({ example: '664abc123def456789000001' })
  insertedId: string;

  @ApiProperty({ example: true })
  acknowledged: boolean;
}

export class MongoInsertManyResponseDto {
  @ApiProperty({ example: 3 })
  insertedCount: number;

  @ApiProperty({ example: true })
  acknowledged: boolean;
}

export class MongoUpdateResponseDto {
  @ApiProperty({ example: 5 })
  matchedCount: number;

  @ApiProperty({ example: 5 })
  modifiedCount: number;

  @ApiPropertyOptional({ example: null, nullable: true })
  upsertedId: string | null;

  @ApiProperty({ example: true })
  acknowledged: boolean;
}

export class MongoDeleteResponseDto {
  @ApiProperty({ example: 2 })
  deletedCount: number;

  @ApiProperty({ example: true })
  acknowledged: boolean;
}
