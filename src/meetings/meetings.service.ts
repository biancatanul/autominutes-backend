import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Meeting, ProcessingStatus } from './entities/meeting.entity';

@Injectable()
export class MeetingsService {
  private meetings: Meeting[] = []; // lives in RAM; resets on restart

  create(dto: CreateMeetingDto): Meeting {
    const now = new Date();
    const meeting: Meeting = {
      id: randomUUID(),
      title: dto.title,
      datetime: new Date(dto.datetime),
      description: dto.description,
      processingStatus: ProcessingStatus.IDLE,
      createdAt: now,
      updatedAt: now,
    };
    this.meetings.push(meeting);
    return meeting;
  }

  findAll(): Meeting[] {
    return this.meetings;
  }

  findOne(id: string): Meeting {
    const meeting = this.meetings.find((m) => m.id === id);
    if (!meeting) throw new NotFoundException(`Meeting ${id} not found`);
    return meeting;
  }

  update(id: string, dto: UpdateMeetingDto): Meeting {
    const meeting = this.findOne(id);
    Object.assign(meeting, dto, { updatedAt: new Date() });
    return meeting;
  }

  remove(id: string): Meeting {
    const index = this.meetings.findIndex((m) => m.id === id);
    if (index === -1) throw new NotFoundException(`Meeting ${id} not found`);
    const [removed] = this.meetings.splice(index, 1);
    return removed;
  }
}
