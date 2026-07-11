import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum ProcessingStatus {
  IDLE = 'idle',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

export type MeetingDocument = HydratedDocument<Meeting>;

@Schema({ timestamps: true })
export class Meeting {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  datetime: Date;

  @Prop()
  description?: string;

  @Prop({ enum: ProcessingStatus, default: ProcessingStatus.IDLE })
  processingStatus: ProcessingStatus;
}

export const MeetingSchema = SchemaFactory.createForClass(Meeting);
