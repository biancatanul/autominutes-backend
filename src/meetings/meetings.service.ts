import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Meeting, MeetingDocument } from './entities/meeting.entity';

@Injectable()
export class MeetingsService {
  constructor(@InjectModel(Meeting.name) private meetingModel: Model<MeetingDocument>) {}

  async create(dto: CreateMeetingDto) {
    return this.meetingModel.create(dto);
  }

  async findAll() {
    return this.meetingModel.find();
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
