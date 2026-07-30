import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Meeting, MeetingDocument } from './entities/meeting.entity';
import { AiResult, AiResultDocument } from 'src/ai-results/entities/ai-result.entity';
import { Attendee, AttendeeDocument } from 'src/attendees/entities/attendee.entity';
import { ActionItem, ActionItemDocument } from 'src/action-items/entities/action-item.entity';
import {
  TranscriptVersion,
  TranscriptVersionDocument,
} from 'src/transcripts/entities/transcript-version.entity';

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
    @InjectModel(TranscriptVersion.name)
    private transcriptVersionModel: Model<TranscriptVersionDocument>,
  ) {}

  async create(dto: CreateMeetingDto) {
    return this.meetingModel.create(dto);
  }

  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.meetingModel.find().skip(skip).limit(limit).lean(),
      this.meetingModel.countDocuments(),
    ]);

    const meetingIds = data.map((m) => m._id);

    const [attendeeCounts, actionItemCounts] = await Promise.all([
      this.attendeeModel.aggregate([
        { $match: { meetingId: { $in: meetingIds } } },
        { $group: { _id: '$meetingId', count: { $sum: 1 } } },
      ]),
      this.actionItemModel.aggregate([
        { $match: { meetingId: { $in: meetingIds } } },
        { $group: { _id: '$meetingId', count: { $sum: 1 } } },
      ]),
    ]);

    const attendeeMap = new Map(attendeeCounts.map((a) => [a._id.toString(), a.count]));
    const actionItemMap = new Map(actionItemCounts.map((a) => [a._id.toString(), a.count]));

    const enriched = data.map((m) => ({
      ...m,
      attendeeCount: attendeeMap.get(m._id.toString()) ?? 0,
      actionItemCount: actionItemMap.get(m._id.toString()) ?? 0,
    }));

    return { data: enriched, total, page, limit };
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
      this.transcriptVersionModel.deleteMany({ meetingId: id }),
    ]);

    return meeting;
  }
}
