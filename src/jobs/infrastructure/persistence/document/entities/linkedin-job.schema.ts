import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, now } from 'mongoose';

export type LinkedinJobSchemaDocument =
  HydratedDocument<LinkedinJobSchemaClass>;

@Schema({
  collection: 'linkedin_jobs',
  timestamps: { createdAt: true, updatedAt: false },
  toJSON: { virtuals: true, getters: true },
})
export class LinkedinJobSchemaClass {
  @Prop({
    type: String,
    required: true,
    unique: true,
    index: true,
  })
  jobId: string;

  @Prop({ default: now })
  createdAt: Date;
}

export const LinkedinJobSchema = SchemaFactory.createForClass(
  LinkedinJobSchemaClass,
);

// Explicit unique index — belt-and-suspenders guarantee beyond the @Prop flag
LinkedinJobSchema.index({ jobId: 1 }, { unique: true });
