import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

import { AllConfigType } from '../config/config.type';
import { MongoAggregateDto } from './dto/mongo-aggregate.dto';
import { MongoDeleteManyDto } from './dto/mongo-delete-many.dto';
import { MongoDeleteOneDto } from './dto/mongo-delete-one.dto';
import { MongoFindOneDto } from './dto/mongo-find-one.dto';
import { MongoFindDto } from './dto/mongo-find.dto';
import { MongoInsertManyDto } from './dto/mongo-insert-many.dto';
import { MongoInsertOneDto } from './dto/mongo-insert-one.dto';
import {
  MongoDeleteResponseDto,
  MongoInsertManyResponseDto,
  MongoInsertOneResponseDto,
  MongoReadResponseDto,
  MongoUpdateResponseDto,
} from './dto/mongo-response.dto';
import { MongoUpdateManyDto } from './dto/mongo-update-many.dto';
import { MongoUpdateOneDto } from './dto/mongo-update-one.dto';

const MAX_RESULT_LIMIT = 200 as const;

/** Stages that write to another collection — targets must be in the allowlist. */
const WRITE_STAGES = ['$out', '$merge'] as const;

@Injectable()
export class MongoProxyService {
  constructor(
    @InjectConnection() private readonly connection: Connection,
    private readonly configService: ConfigService<AllConfigType>,
  ) {}

  // ─── Read operations ─────────────────────────────────────────────────────

  async find(dto: MongoFindDto): Promise<MongoReadResponseDto> {
    this.validateCollection(dto.collection);

    const limit = Math.min(dto.limit ?? MAX_RESULT_LIMIT, MAX_RESULT_LIMIT);
    const col = this.getCollection(dto.collection);

    const data = await col
      .find(dto.filter ?? {}, {
        projection: dto.projection,

        sort: dto.sort as any,
        skip: dto.skip ?? 0,
        limit,
      })
      .toArray();

    return this.buildReadResponse(data, dto.collection, 'find', limit);
  }

  async findOne(dto: MongoFindOneDto): Promise<Record<string, unknown> | null> {
    this.validateCollection(dto.collection);

    const col = this.getCollection(dto.collection);
    const doc = await col.findOne(dto.filter ?? {}, {
      projection: dto.projection,
    });

    return doc as Record<string, unknown> | null;
  }

  async aggregate(dto: MongoAggregateDto): Promise<MongoReadResponseDto> {
    this.validateCollection(dto.collection);
    this.validatePipelineWriteStages(dto.pipeline);

    const col = this.getCollection(dto.collection);

    // Enforce a $limit at the end so the caller can't accidentally pull unbounded results
    const safePipeline = this.enforcePipelineLimit(dto.pipeline);
    const data = await col.aggregate(safePipeline).toArray();

    return this.buildReadResponse(
      data as Record<string, unknown>[],
      dto.collection,
      'aggregate',
      MAX_RESULT_LIMIT,
    );
  }

  // ─── Write operations ─────────────────────────────────────────────────────

  async insertOne(dto: MongoInsertOneDto): Promise<MongoInsertOneResponseDto> {
    this.validateCollection(dto.collection);

    const col = this.getCollection(dto.collection);
    const result = await col.insertOne(dto.document);

    return {
      insertedId: result.insertedId.toString(),
      acknowledged: result.acknowledged,
    };
  }

  async insertMany(
    dto: MongoInsertManyDto,
  ): Promise<MongoInsertManyResponseDto> {
    this.validateCollection(dto.collection);

    const col = this.getCollection(dto.collection);
    const result = await col.insertMany(dto.documents, { ordered: false });

    return {
      insertedCount: result.insertedCount,
      acknowledged: result.acknowledged,
    };
  }

  async updateOne(dto: MongoUpdateOneDto): Promise<MongoUpdateResponseDto> {
    this.validateCollection(dto.collection);

    const col = this.getCollection(dto.collection);
    const result = await col.updateOne(dto.filter, dto.update, {
      upsert: dto.upsert ?? false,
    });

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId?.toString() ?? null,
      acknowledged: result.acknowledged,
    };
  }

  async updateMany(dto: MongoUpdateManyDto): Promise<MongoUpdateResponseDto> {
    this.validateCollection(dto.collection);
    this.rejectEmptyFilter(dto.filter, 'updateMany');

    const col = this.getCollection(dto.collection);
    const result = await col.updateMany(dto.filter, dto.update, {
      upsert: dto.upsert ?? false,
    });

    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId?.toString() ?? null,
      acknowledged: result.acknowledged,
    };
  }

  async deleteOne(dto: MongoDeleteOneDto): Promise<MongoDeleteResponseDto> {
    this.validateCollection(dto.collection);

    const col = this.getCollection(dto.collection);
    const result = await col.deleteOne(dto.filter);

    return {
      deletedCount: result.deletedCount,
      acknowledged: result.acknowledged,
    };
  }

  async deleteMany(dto: MongoDeleteManyDto): Promise<MongoDeleteResponseDto> {
    this.validateCollection(dto.collection);
    this.rejectEmptyFilter(dto.filter, 'deleteMany');

    const col = this.getCollection(dto.collection);
    const result = await col.deleteMany(dto.filter);

    return {
      deletedCount: result.deletedCount,
      acknowledged: result.acknowledged,
    };
  }

  // ─── Private guards ───────────────────────────────────────────────────────

  private getAllowedCollections(): string[] {
    return (
      this.configService.get('app.mongoAllowedCollections', { infer: true }) ??
      []
    );
  }

  private validateCollection(name: string): void {
    const allowed = this.getAllowedCollections();

    if (!allowed.includes(name)) {
      throw new ForbiddenException(
        `Collection '${name}' is not in MONGO_ALLOWED_COLLECTIONS. ` +
          `Allowed: [${allowed.join(', ')}]`,
      );
    }
  }

  private rejectEmptyFilter(
    filter: Record<string, unknown>,
    operation: string,
  ): void {
    if (!filter || Object.keys(filter).length === 0) {
      throw new BadRequestException(
        `Empty filter {} is not allowed for '${operation}' — ` +
          `it would affect ALL documents in the collection.`,
      );
    }
  }

  /**
   * Scans aggregation pipeline stages for $out and $merge.
   * If the target collection is not in the allowlist, rejects the request.
   */
  private validatePipelineWriteStages(
    pipeline: Record<string, unknown>[],
  ): void {
    const allowed = this.getAllowedCollections();

    for (const stage of pipeline) {
      for (const writeStage of WRITE_STAGES) {
        const target = stage[writeStage];
        if (target === undefined) continue;

        const targetCollection =
          typeof target === 'string'
            ? target
            : ((target as Record<string, unknown>)?.into?.toString() ??
              (target as Record<string, unknown>)?.coll?.toString());

        if (!targetCollection || !allowed.includes(targetCollection)) {
          throw new ForbiddenException(
            `Pipeline ${writeStage} target '${targetCollection ?? 'unknown'}' ` +
              `is not in MONGO_ALLOWED_COLLECTIONS.`,
          );
        }
      }
    }
  }

  /**
   * Appends a $limit stage if none is present in the pipeline,
   * enforcing the hard cap of MAX_RESULT_LIMIT.
   */
  private enforcePipelineLimit(
    pipeline: Record<string, unknown>[],
  ): Record<string, unknown>[] {
    const hasLimit = pipeline.some((stage) => stage['$limit'] !== undefined);

    if (hasLimit) {
      // If caller already added a $limit, clamp it to our max
      return pipeline.map((stage) => {
        if (stage['$limit'] !== undefined) {
          const requested = Number(stage['$limit']);
          return { $limit: Math.min(requested, MAX_RESULT_LIMIT) };
        }
        return stage;
      });
    }

    return [...pipeline, { $limit: MAX_RESULT_LIMIT }];
  }

  private getCollection(name: string) {
    return this.connection.db!.collection(name);
  }

  private buildReadResponse(
    data: Record<string, unknown>[],
    collection: string,
    operation: string,
    limitEnforced: number,
  ): MongoReadResponseDto {
    return {
      data,
      meta: {
        collection,
        operation,
        count: data.length,
        limitEnforced,
      },
    };
  }
}
