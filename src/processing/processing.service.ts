import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LlmService } from '../llm/llm.service';
import { Meeting, MeetingDocument, ProcessingStatus } from '../meetings/entities/meeting.entity';
import { AiResult, AiResultDocument } from '../ai-results/entities/ai-result.entity';
import {
  ActionItem,
  ActionItemDocument,
  ActionItemStatus,
} from '../action-items/entities/action-item.entity';

@Injectable()
export class ProcessingService {
  private readonly logger = new Logger(ProcessingService.name);

  constructor(
    @InjectModel(Meeting.name) private readonly meetingModel: Model<MeetingDocument>,
    @InjectModel(AiResult.name) private readonly aiResultModel: Model<AiResultDocument>,
    @InjectModel(ActionItem.name) private readonly actionItemModel: Model<ActionItemDocument>,
    private readonly llmService: LlmService,
  ) {}

  async processMeeting(meetingId: string) {
    const meeting = await this.meetingModel.findById(meetingId).exec();
    if (!meeting) throw new NotFoundException(`Meeting ${meetingId} not found`);
    if (!meeting.transcript?.trim()) {
      throw new BadRequestException('Meeting has no transcript to process');
    }

    meeting.processingStatus = ProcessingStatus.PROCESSING;
    await meeting.save();

    try {
      const ai = await this.llmService.generateMeetingInsights(meeting.transcript);

      const objId = new Types.ObjectId(meetingId);

      const last = await this.aiResultModel
        .findOne({ meetingId: objId })
        .sort({ version: -1 })
        .exec();
      const version = (last?.version ?? 0) + 1;

      const aiResult = await this.aiResultModel.create({
        meetingId: objId,
        summary: ai.summary,
        discussionPoints: ai.discussionPoints,
        version,
      });

      const createdItems = ai.actionItems.length
        ? await this.actionItemModel.insertMany(
            ai.actionItems
              .filter((a) => a.description && a.description.trim() !== '')
              .map((a) => ({
                description: a.description,
                assignee: a.assignee,
                deadline: this.parseDeadline(a.deadline),
                status: this.mapStatus(a.status),
                meetingId: objId,
              })),
          )
        : [];

      meeting.processingStatus = ProcessingStatus.COMPLETED;
      await meeting.save();

      return { meetingId, status: meeting.processingStatus, aiResult, actionItems: createdItems };
    } catch (err) {
      meeting.processingStatus = ProcessingStatus.FAILED;
      await meeting.save();
      this.logger.error(`Processing failed for meeting ${meetingId}`, err as Error);
      throw err;
    }
  }

  private parseDeadline(value?: string): Date | undefined {
    if (!value) return undefined;
    const d = new Date(value);
    return isNaN(d.getTime()) ? undefined : d; // Wednesday = undefined; only clear dates like 2026-07-15 stored for now; needs improvement
  }

  private mapStatus(status?: string): ActionItemStatus {
    switch ((status ?? '').toUpperCase()) {
      case 'IN_PROGRESS':
        return ActionItemStatus.IN_PROGRESS;
      case 'DONE':
        return ActionItemStatus.DONE;
      default:
        return ActionItemStatus.OPEN;
    }
  }
}
