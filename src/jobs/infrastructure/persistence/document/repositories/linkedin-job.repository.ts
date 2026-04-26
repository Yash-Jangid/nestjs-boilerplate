import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { LinkedinJobSchemaClass } from '../entities/linkedin-job.schema';

const MAX_BATCH_SIZE = 1000 as const;

@Injectable()
export class LinkedinJobRepository {
  constructor(
    @InjectModel(LinkedinJobSchemaClass.name)
    private readonly model: Model<LinkedinJobSchemaClass>,
  ) {}

  /**
   * Returns all jobIds from the provided list that already exist in the DB.
   * Uses the unique index on jobId for O(log n) per-item lookup via $in.
   */
  async findExistingJobIds(jobIds: string[]): Promise<string[]> {
    const docs = await this.model
      .find({ jobId: { $in: jobIds } }, { jobId: 1, _id: 0 })
      .lean()
      .exec();

    return docs.map((doc) => doc.jobId);
  }

  /**
   * Inserts new jobs in a single bulk operation.
   * { ordered: false } skips duplicates silently — safe against races.
   */
  async insertMany(jobIds: string[]): Promise<void> {
    if (!jobIds.length) return;

    const docs = jobIds.map((jobId) => ({ jobId }));

    await this.model
      .insertMany(docs, { ordered: false })
      .catch((err: { code?: number }) => {
        // Code 11000 = duplicate key — expected in race conditions, ignore silently
        if (err?.code !== 11000) {
          throw err;
        }
      });
  }
}

export { MAX_BATCH_SIZE };
