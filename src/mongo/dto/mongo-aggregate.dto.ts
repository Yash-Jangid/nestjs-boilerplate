import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsObject, IsString } from 'class-validator';

export class MongoAggregateDto {
  @ApiProperty({
    example: 'workflow_leads',
    description: 'Target collection name (must be in the allowed list)',
  })
  @IsString()
  collection: string;

  @ApiProperty({
    type: [Object],
    description: 'MongoDB aggregation pipeline stages',
    example: [
      { $match: { status: 'new' } },
      {
        $lookup: {
          from: 'Linkedin_Public_search_urls',
          localField: 'jobId',
          foreignField: 'jobId',
          as: 'linkedinData',
        },
      },
      { $limit: 100 },
    ],
  })
  @IsArray()
  @IsObject({ each: true })
  pipeline: Record<string, unknown>[];
}
