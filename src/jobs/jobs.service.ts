import { Injectable } from '@nestjs/common';

import {
  DedupeJobsRequestDto,
  DedupeJobsResponseDto,
} from './dto/dedupe-jobs.dto';
import { LinkedinJobRepository } from './infrastructure/persistence/document/repositories/linkedin-job.repository';

@Injectable()
export class JobsService {
  constructor(private readonly linkedinJobRepository: LinkedinJobRepository) {}

  async deduplicateJobs(
    dto: DedupeJobsRequestDto,
  ): Promise<DedupeJobsResponseDto> {
    const uniqueIds = this.deduplicateInput(dto.jobIds);

    const existingIds =
      await this.linkedinJobRepository.findExistingJobIds(uniqueIds);

    const existingSet = new Set(existingIds);
    const newIds = uniqueIds.filter((id) => !existingSet.has(id));

    await this.linkedinJobRepository.insertMany(newIds);

    return {
      newIds,
      existingIds,
      meta: {
        total: uniqueIds.length,
        newCount: newIds.length,
        existingCount: existingIds.length,
      },
    };
  }

  /** Removes duplicates from caller input while preserving order. */
  private deduplicateInput(jobIds: string[]): string[] {
    return [...new Set(jobIds)];
  }
}
