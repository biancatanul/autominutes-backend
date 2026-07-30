import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Meeting, MeetingDocument } from '../meetings/entities/meeting.entity';
import { TranscriptVersion, TranscriptVersionDocument } from './entities/transcript-version.entity';

@Injectable()
export class TranscriptsService {
  constructor(
    @InjectModel(TranscriptVersion.name)
    private readonly model: Model<TranscriptVersionDocument>,
    @InjectModel(Meeting.name)
    private readonly meetingModel: Model<MeetingDocument>,
  ) {}

  private async nextVersion(meetingId: string) {
    const last = await this.model.findOne({ meetingId }).sort({ version: -1 });
    return (last?.version ?? 0) + 1;
  }

  async addFileVersion(meetingId: string, file: Express.Multer.File) {
    const meeting = await this.meetingModel.findById(meetingId);
    if (!meeting) throw new NotFoundException(`Meeting ${meetingId} not found`);

    let text: string;
    if (file.originalname.toLowerCase().endsWith('.docx')) {
      const mammoth = await import('mammoth');
      text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
    } else {
      text = file.buffer.toString('utf-8');
    }
    if (!text.trim()) throw new BadRequestException('Transcript is empty');

    const version = await this.nextVersion(meetingId);
    const doc = await this.model.create({
      meetingId,
      version,
      text,
      source: 'upload',
      filename: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      data: file.buffer,
    });

    meeting.transcript = text;
    await meeting.save();
    return doc;
  }

  async addTextVersion(meetingId: string, text: string) {
    const meeting = await this.meetingModel.findById(meetingId);
    if (!meeting) throw new NotFoundException(`Meeting ${meetingId} not found`);
    if (!text.trim()) throw new BadRequestException('Transcript is empty');

    const version = await this.nextVersion(meetingId);
    const doc = await this.model.create({ meetingId, version, text, source: 'paste' });
    meeting.transcript = text;
    await meeting.save();
    return meeting;
  }

  listVersions(meetingId: string) {
    return this.model.find({ meetingId }).select('-data -text').sort({ version: -1 });
  }

  async getVersion(meetingId: string, version: number) {
    const v = await this.model.findOne({ meetingId, version });
    if (!v) throw new NotFoundException(`Transcript version ${version} not found`);
    return v;
  }

  async getCurrentTranscript(meetingId: string): Promise<{ transcript: string | null }> {
    const meeting = await this.meetingModel.findById(meetingId);
    if (!meeting) throw new NotFoundException(`Meeting ${meetingId} not found`);
    return { transcript: meeting.transcript ?? null };
  }
}
