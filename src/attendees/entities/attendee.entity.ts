import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, SchemaTypes } from 'mongoose';

export type AttendeeDocument = HydratedDocument<Attendee>;

@Schema({ timestamps: true })
export class Attendee {
  @Prop({ required: true })
  name: string;

  @Prop()
  email?: string;

  @Prop()
  role?: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Meeting', required: true })
  meetingId: Types.ObjectId; // references the meeting this attendee belongs to
}

export const AttendeeSchema = SchemaFactory.createForClass(Attendee);
