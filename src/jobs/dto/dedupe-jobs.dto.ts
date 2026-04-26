import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class DedupeJobsRequestDto {
  @ApiProperty({
    description: 'Array of LinkedIn job IDs to deduplicate',
    example: ['4402165492', '4403053369', '4402724689'],
    type: [String],
    maxItems: 1000,
  })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(1000)
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  jobIds: string[];
}

export class DedupeJobsMetaDto {
  @ApiProperty({ example: 3 })
  total: number;

  @ApiProperty({ example: 1 })
  newCount: number;

  @ApiProperty({ example: 2 })
  existingCount: number;
}

export class DedupeJobsResponseDto {
  @ApiProperty({ example: ['4402724689'], type: [String] })
  newIds: string[];

  @ApiProperty({ example: ['4402165492', '4403053369'], type: [String] })
  existingIds: string[];

  @ApiProperty({ type: DedupeJobsMetaDto })
  meta: DedupeJobsMetaDto;
}
