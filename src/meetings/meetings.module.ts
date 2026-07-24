import { Module } from '@nestjs/common';
import { MeetingsService } from './meetings.service';
import { MeetingsController } from './meetings.controller';
import { Meeting, MeetingSchema } from './entities/meeting.entity';
import { ActionItem, ActionItemSchema } from '../action-items/entities/action-item.entity';
import { Attendee, AttendeeSchema } from '../attendees/entities/attendee.entity';
import { AiResult, AiResultSchema } from '../ai-results/entities/ai-result.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Meeting.name, schema: MeetingSchema },
      { name: ActionItem.name, schema: ActionItemSchema },
      { name: Attendee.name, schema: AttendeeSchema },
      { name: AiResult.name, schema: AiResultSchema },
    ]),
  ],
  controllers: [MeetingsController],
  providers: [MeetingsService],
  exports: [MeetingsService],
})
export class MeetingsModule {}
