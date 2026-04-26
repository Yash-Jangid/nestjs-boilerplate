import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { LinkedinJobPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { ApiKeyGuard } from '../utils/guards/api-key.guard';

@Module({
  imports: [ConfigModule, LinkedinJobPersistenceModule],
  controllers: [JobsController],
  providers: [JobsService, ApiKeyGuard],
})
export class JobsModule {}
