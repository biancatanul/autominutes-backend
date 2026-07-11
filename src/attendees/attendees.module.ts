import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AttendeesService } from './attendees.service';
import { AttendeesController } from './attendees.controller';
import { MeetingsModule } from '../meetings/meetings.module';
import { Attendee, AttendeeSchema } from './entities/attendee.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Attendee.name, schema: AttendeeSchema }]),
    MeetingsModule,
  ],
  controllers: [AttendeesController],
  providers: [AttendeesService],
})
export class AttendeesModule {}
