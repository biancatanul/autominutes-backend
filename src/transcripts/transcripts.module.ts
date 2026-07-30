import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TranscriptsController } from './transcripts.controller';
import { TranscriptsService } from './transcripts.service';
import { TranscriptVersion, TranscriptVersionSchema } from './entities/transcript-version.entity';
import { Meeting, MeetingSchema } from '../meetings/entities/meeting.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TranscriptVersion.name, schema: TranscriptVersionSchema },
      { name: Meeting.name, schema: MeetingSchema }, // service updates meeting.transcript
    ]),
  ],
  controllers: [TranscriptsController],
  providers: [TranscriptsService],
  exports: [TranscriptsService],
})
export class TranscriptsModule {}
