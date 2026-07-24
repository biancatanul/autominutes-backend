import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Meeting, MeetingDocument } from './entities/meeting.entity';
import { AiResult, AiResultDocument } from 'src/ai-results/entities/ai-result.entity';
import { Attendee, AttendeeDocument } from 'src/attendees/entities/attendee.entity';
import { ActionItem, ActionItemDocument } from 'src/action-items/entities/action-item.entity';

export type PaginatedMeetings = {
  data: Meeting[];
  total: number;
  page: number;
  limit: number;
};

@Injectable()
export class MeetingsService {
  constructor(
    @InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>,
    @InjectModel(ActionItem.name) private actionItemModel: Model<ActionItemDocument>,
    @InjectModel(Attendee.name) private attendeeModel: Model<AttendeeDocument>,
    @InjectModel(AiResult.name) private aiResultModel: Model<AiResultDocument>,
  ) {}

  async create(dto: CreateMeetingDto) {
    return this.meetingModel.create(dto);
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.meetingModel.find().skip(skip).limit(limit),
      this.meetingModel.countDocuments(),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const meeting = await this.meetingModel.findById(id);
    if (!meeting) throw new NotFoundException(`Meeting ${id} not found`);
    return meeting;
  }

  async update(id: string, dto: UpdateMeetingDto) {
    const meeting = await this.meetingModel.findByIdAndUpdate(id, dto, { new: true });
    if (!meeting) throw new NotFoundException(`Meeting ${id} not found`);
    return meeting;
  }

  async remove(id: string) {
    const meeting = await this.meetingModel.findByIdAndDelete(id);
    if (!meeting) throw new NotFoundException(`Meeting ${id} not found`);

    await Promise.all([
      this.actionItemModel.deleteMany({ meetingId: id }),
      this.attendeeModel.deleteMany({ meetingId: id }),
      this.aiResultModel.deleteMany({ meetingId: id }),
    ]);

    return meeting;
  }

  async setTranscript(id: string, text: string): Promise<Meeting> {
    const meeting = await this.meetingModel
      .findByIdAndUpdate(id, { transcript: text }, { new: true })
      .exec();
    if (!meeting) throw new NotFoundException(`Meeting ${id} not found`);
    return meeting;
  }

  async getTranscript(id: string): Promise<{ transcript: string | null }> {
    const meeting = await this.findOne(id);
    return { transcript: meeting.transcript ?? null };
  }
}
