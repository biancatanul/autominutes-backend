import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types, SchemaTypes } from 'mongoose';

export enum ActionItemStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  UNKNOWN = 'UNKNOWN',
}

export type ActionItemDocument = HydratedDocument<ActionItem>;

@Schema({ timestamps: true })
export class ActionItem {
  @Prop({ required: true })
  description: string;

  @Prop()
  assignee?: string; // just a string for now, could become a reference to an attendee

  @Prop()
  deadline?: Date;

  @Prop({ enum: ActionItemStatus, default: ActionItemStatus.OPEN })
  status: ActionItemStatus;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'Meeting', required: true })
  meetingId: Types.ObjectId; // every action item must belong to a meeting
}

export const ActionItemSchema = SchemaFactory.createForClass(ActionItem);
