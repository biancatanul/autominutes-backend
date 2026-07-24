import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProcessingService } from './processing.service';
import { ProcessingController } from './processing.controller';
import { LlmModule } from '../llm/llm.module';
import { Meeting, MeetingSchema } from '../meetings/entities/meeting.entity';
import { AiResult, AiResultSchema } from '../ai-results/entities/ai-result.entity';
import { ActionItem, ActionItemSchema } from '../action-items/entities/action-item.entity';
import { Attendee, AttendeeSchema } from '../attendees/entities/attendee.entity';

@Module({
  imports: [
    LlmModule,
    MongooseModule.forFeature([
      { name: Meeting.name, schema: MeetingSchema },
      { name: AiResult.name, schema: AiResultSchema },
      { name: ActionItem.name, schema: ActionItemSchema },
      { name: Attendee.name, schema: AttendeeSchema },
    ]),
  ],
  controllers: [ProcessingController],
  providers: [ProcessingService],
})
export class ProcessingModule {}
