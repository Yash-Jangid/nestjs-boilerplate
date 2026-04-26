import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { ApiKeyGuard } from '../utils/guards/api-key.guard';
import {
  DedupeJobsRequestDto,
  DedupeJobsResponseDto,
} from './dto/dedupe-jobs.dto';
import { JobsService } from './jobs.service';

@ApiTags('Jobs')
@ApiSecurity('x-api-key')
@UseGuards(ApiKeyGuard)
@Controller({
  path: 'jobs',
  version: '1',
})
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('dedupe')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: DedupeJobsResponseDto,
    description: 'Returns new and existing job IDs with metadata.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid x-api-key header.',
  })
  async deduplicate(
    @Body() dto: DedupeJobsRequestDto,
  ): Promise<DedupeJobsResponseDto> {
    return this.jobsService.deduplicateJobs(dto);
  }
}
