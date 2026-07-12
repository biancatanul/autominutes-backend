import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AiResult, AiResultDocument } from './entities/ai-result.entity';

@Injectable()
export class AiResultsService {
  constructor(
    @InjectModel(AiResult.name) private readonly aiResultModel: Model<AiResultDocument>,
  ) {}

  findByMeeting(meetingId: string) {
    return this.aiResultModel
      .find({ meetingId: new Types.ObjectId(meetingId) })
      .sort({ version: -1 })
      .exec();
  }
}
