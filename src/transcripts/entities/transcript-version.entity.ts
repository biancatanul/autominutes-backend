import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, SchemaTypes, Types } from 'mongoose';

export type TranscriptVersionDocument = HydratedDocument<TranscriptVersion>;

@Schema({ timestamps: true })
export class TranscriptVersion {
  @Prop({ type: SchemaTypes.ObjectId, ref: 'Meeting', required: true })
  meetingId: Types.ObjectId;

  @Prop({ required: true }) version: number;
  @Prop({ required: true }) text: string;
  @Prop({ enum: ['upload', 'paste'], default: 'paste' }) source: string;

  @Prop() filename?: string;
  @Prop() mimeType?: string;
  @Prop() size?: number;
  @Prop({ type: Buffer }) data?: Buffer; // original file bytes
}
export const TranscriptVersionSchema = SchemaFactory.createForClass(TranscriptVersion);
