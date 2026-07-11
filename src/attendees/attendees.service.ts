import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { MeetingsService } from '../meetings/meetings.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { Attendee } from './entities/attendee.entity';

@Injectable()
export class AttendeesService {
  private attendees: Attendee[] = [];

  constructor(private readonly meetingsService: MeetingsService) {}

  create(dto: CreateAttendeeDto): Attendee {
    this.meetingsService.findOne(dto.meetingId);

    const now = new Date();
    const attendee: Attendee = {
      id: randomUUID(),
      name: dto.name,
      email: dto.email,
      role: dto.role,
      meetingId: dto.meetingId,
      createdAt: now,
      updatedAt: now,
    };
    this.attendees.push(attendee);
    return attendee;
  }

  findAll(meetingId?: string): Attendee[] {
    return meetingId ? this.attendees.filter((a) => a.meetingId === meetingId) : this.attendees;
  }

  findOne(id: string): Attendee {
    const attendee = this.attendees.find((a) => a.id === id);
    if (!attendee) throw new NotFoundException(`Attendee ${id} not found`);
    return attendee;
  }

  update(id: string, dto: UpdateAttendeeDto): Attendee {
    const attendee = this.findOne(id);
    Object.assign(attendee, dto, { updatedAt: new Date() });
    return attendee;
  }

  remove(id: string): Attendee {
    const index = this.attendees.findIndex((a) => a.id === id);
    if (index === -1) throw new NotFoundException(`Attendee ${id} not found`);
    const [removed] = this.attendees.splice(index, 1);
    return removed;
  }
}
