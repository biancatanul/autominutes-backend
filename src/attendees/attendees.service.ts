import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { MeetingsService } from '../meetings/meetings.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';
import { Attendee, AttendeeDocument } from './entities/attendee.entity';

@Injectable()
export class AttendeesService {
  constructor(
    @InjectModel(Attendee.name) private attendeeModel: Model<AttendeeDocument>,
    private readonly meetingsService: MeetingsService,
  ) {}

  async create(dto: CreateAttendeeDto) {
    await this.meetingsService.findOne(dto.meetingId); // throws if meeting doesn't exist
    return this.attendeeModel.create(dto);
  }

  async findAll(meetingId?: string) {
    const filter = meetingId ? { meetingId } : {};
    return this.attendeeModel.find(filter);
  }

  async findOne(id: string) {
    const attendee = await this.attendeeModel.findById(id);
    if (!attendee) throw new NotFoundException(`Attendee ${id} not found`);
    return attendee;
  }

  async update(id: string, dto: UpdateAttendeeDto) {
    const attendee = await this.attendeeModel.findByIdAndUpdate(id, dto, { new: true });
    if (!attendee) throw new NotFoundException(`Attendee ${id} not found`);
    return attendee;
  }

  async remove(id: string) {
    const attendee = await this.attendeeModel.findByIdAndDelete(id);
    if (!attendee) throw new NotFoundException(`Attendee ${id} not found`);
    return attendee;
  }
}
