import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class MongoFindDto {
  @ApiProperty({
    example: 'workflow_leads',
    description: 'Target collection name (must be in the allowed list)',
  })
  @IsString()
  collection: string;

  @ApiPropertyOptional({
    type: Object,
    example: { status: 'new' },
    description: 'MongoDB filter expression',
  })
  @IsOptional()
  @IsObject()
  filter?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: Object,
    example: { name: 1, email: 1, _id: 0 },
    description: 'Fields to include/exclude',
  })
  @IsOptional()
  @IsObject()
  projection?: Record<string, unknown>;

  @ApiPropertyOptional({
    type: Object,
    example: { createdAt: -1 },
    description: 'Sort specification',
  })
  @IsOptional()
  @IsObject()
  sort?: Record<string, unknown>;

  @ApiPropertyOptional({ example: 0, description: 'Number of docs to skip' })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip?: number;

  @ApiPropertyOptional({
    example: 50,
    description: 'Max documents to return (hard cap: 200)',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(200)
  limit?: number;
}
