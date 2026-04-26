import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  MongooseModuleOptions,
  MongooseOptionsFactory,
} from '@nestjs/mongoose';
import { AllConfigType } from '../config/config.type';
import mongooseAutoPopulate from 'mongoose-autopopulate';

@Injectable()
export class MongooseConfigService implements MongooseOptionsFactory {
  constructor(private readonly configService: ConfigService<AllConfigType>) {}

  createMongooseOptions(): MongooseModuleOptions {
    const uri = this.configService.get('database.url', { infer: true });

    return {
      uri,
      dbName: this.configService.get('database.name', { infer: true }),
      connectionFactory(connection) {
        connection.plugin(mongooseAutoPopulate);
        return connection;
      },
    };
  }
}
