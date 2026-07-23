import * as chrono from 'chrono-node';
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

      const MATCH_THRESHOLD = 0.6;

      const existingItems = await this.actionItemModel.find({ meetingId: objId }).exec();
      const existingEntries = existingItems.map((item) => ({
        item,
        tokens: this.tokenize(item.description),
      }));
      const claimed = new Set<string>();

      const toInsert: Partial<ActionItem>[] = [];
      const updated: ActionItemDocument[] = [];

      for (const raw of ai.actionItems) {
        if (!raw.description || raw.description.trim() === '') continue;

        const tokens = this.tokenize(raw.description);

        let best: { item: ActionItemDocument; score: number } | undefined;
        for (const entry of existingEntries) {
          if (claimed.has(String(entry.item._id))) continue;
          const score = this.similarity(tokens, entry.tokens);
          if (score >= MATCH_THRESHOLD && (!best || score > best.score)) {
            best = { item: entry.item, score };
          }
        }

        const deadline = this.parseDeadline(raw.deadline, meeting.datetime);

        if (best) {
          claimed.add(String(best.item._id));
          let changed = false;
          if (!best.item.assignee && raw.assignee) {
            best.item.assignee = raw.assignee;
            changed = true;
          }
          if (!best.item.deadline && deadline) {
            best.item.deadline = deadline;
            changed = true;
          }
          if (changed) await best.item.save();
          updated.push(best.item);
        } else {
          toInsert.push({
            description: raw.description,
            assignee: raw.assignee,
            deadline,
            status: this.mapStatus(raw.status),
            meetingId: objId,
          });
        }
      }

      const createdItems = toInsert.length ? await this.actionItemModel.insertMany(toInsert) : [];

      meeting.processingStatus = ProcessingStatus.COMPLETED;
      await meeting.save();

      return {
        meetingId,
        status: meeting.processingStatus,
        aiResult,
        actionItems: [...updated, ...createdItems],
      };
    } catch (err) {
      meeting.processingStatus = ProcessingStatus.FAILED;
      await meeting.save();
      this.logger.error(`Processing failed for meeting ${meetingId}`, err as Error);
      throw err;
    }
  }

  private static readonly STOPWORDS = new Set([
    'a',
    'an',
    'the',
    'to',
    'by',
    'for',
    'in',
    'on',
    'at',
    'of',
    'and',
    'with',
  ]);

  private tokenize(description: string): Set<string> {
    return new Set(
      description
        .trim()
        .toLowerCase()
        .replace(/[.!?]+$/, '')
        .split(/\s+/)
        .filter((word) => word.length > 0 && !ProcessingService.STOPWORDS.has(word)),
    );
  }

  private similarity(a: Set<string>, b: Set<string>): number {
    let intersection = 0;
    for (const word of a) if (b.has(word)) intersection++;
    const smaller = Math.min(a.size, b.size);
    return smaller === 0 ? 0 : intersection / smaller;
  }

  private parseDeadline(value: string | undefined, referenceDate: Date): Date | undefined {
    if (!value) return undefined;

    const native = new Date(value);
    if (!isNaN(native.getTime())) return native; // ISO style dates are parsed correctly by Date constructor

    const parsed = chrono.parseDate(value, referenceDate, { forwardDate: true }); // fallback to chrono-node for relative dates like "next Monday" or "in 3 days"
    return parsed ?? undefined;
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
