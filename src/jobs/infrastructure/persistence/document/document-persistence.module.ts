import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  LinkedinJobSchema,
  LinkedinJobSchemaClass,
} from './entities/linkedin-job.schema';
import { LinkedinJobRepository } from './repositories/linkedin-job.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: LinkedinJobSchemaClass.name, schema: LinkedinJobSchema },
    ]),
  ],
  providers: [LinkedinJobRepository],
  exports: [LinkedinJobRepository],
})
export class LinkedinJobPersistenceModule {}
