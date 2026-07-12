import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type AiResultDocument = HydratedDocument<AiResult>;

@Schema({ timestamps: true })
export class AiResult {
  @Prop({ type: Types.ObjectId, ref: 'Meeting', required: true })
  meetingId: Types.ObjectId;

  @Prop({ required: true })
  summary: string;

  @Prop({ type: [String], default: [] })
  discussionPoints: string[];

  @Prop({ required: true, default: 1 })
  version: number;
}

export const AiResultSchema = SchemaFactory.createForClass(AiResult);
