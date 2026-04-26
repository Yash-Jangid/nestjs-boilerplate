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
import { N8nOriginGuard } from './guards/n8n-origin.guard';
import { MongoProxyService } from './mongo-proxy.service';

@ApiTags('Mongo Proxy')
@ApiSecurity('x-api-key')
@ApiUnauthorizedResponse({
  description: 'Missing or invalid x-api-key header.',
})
@UseGuards(ApiKeyGuard, N8nOriginGuard)
@Controller({ path: 'mongo', version: '1' })
export class MongoProxyController {
  constructor(private readonly mongoProxyService: MongoProxyService) {}

  @Post('find')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MongoReadResponseDto })
  find(@Body() dto: MongoFindDto): Promise<MongoReadResponseDto> {
    return this.mongoProxyService.find(dto);
  }

  @Post('find-one')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: Object })
  findOne(
    @Body() dto: MongoFindOneDto,
  ): Promise<Record<string, unknown> | null> {
    return this.mongoProxyService.findOne(dto);
  }

  @Post('aggregate')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MongoReadResponseDto })
  aggregate(@Body() dto: MongoAggregateDto): Promise<MongoReadResponseDto> {
    return this.mongoProxyService.aggregate(dto);
  }

  @Post('insert-one')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MongoInsertOneResponseDto })
  insertOne(
    @Body() dto: MongoInsertOneDto,
  ): Promise<MongoInsertOneResponseDto> {
    return this.mongoProxyService.insertOne(dto);
  }

  @Post('insert-many')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MongoInsertManyResponseDto })
  insertMany(
    @Body() dto: MongoInsertManyDto,
  ): Promise<MongoInsertManyResponseDto> {
    return this.mongoProxyService.insertMany(dto);
  }

  @Post('update-one')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MongoUpdateResponseDto })
  updateOne(@Body() dto: MongoUpdateOneDto): Promise<MongoUpdateResponseDto> {
    return this.mongoProxyService.updateOne(dto);
  }

  @Post('update-many')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MongoUpdateResponseDto })
  updateMany(@Body() dto: MongoUpdateManyDto): Promise<MongoUpdateResponseDto> {
    return this.mongoProxyService.updateMany(dto);
  }

  @Post('delete-one')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MongoDeleteResponseDto })
  deleteOne(@Body() dto: MongoDeleteOneDto): Promise<MongoDeleteResponseDto> {
    return this.mongoProxyService.deleteOne(dto);
  }

  @Post('delete-many')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: MongoDeleteResponseDto })
  deleteMany(@Body() dto: MongoDeleteManyDto): Promise<MongoDeleteResponseDto> {
    return this.mongoProxyService.deleteMany(dto);
  }
}
