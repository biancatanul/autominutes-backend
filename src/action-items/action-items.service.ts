import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ActionItem, ActionItemDocument } from './entities/action-item.entity';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';
import { MeetingsService } from '../meetings/meetings.service';

@Injectable()
export class ActionItemsService {
  constructor(
    @InjectModel(ActionItem.name) private actionItemModel: Model<ActionItemDocument>,
    private readonly meetingsService: MeetingsService,
  ) {}

  async create(dto: CreateActionItemDto) {
    await this.meetingsService.findOne(dto.meetingId);
    return this.actionItemModel.create(dto);
  }

  async findAll(meetingId?: string) {
    const filter = meetingId ? { meetingId } : {};
    return this.actionItemModel.find(filter);
  }

  async findOne(id: string) {
    const item = await this.actionItemModel.findById(id);
    if (!item) throw new NotFoundException(`Action item ${id} not found`);
    return item;
  }

  async update(id: string, dto: UpdateActionItemDto) {
    const item = await this.actionItemModel.findByIdAndUpdate(id, dto, { new: true });
    if (!item) throw new NotFoundException(`Action item ${id} not found`);
    return item;
  }

  async remove(id: string) {
    const item = await this.actionItemModel.findByIdAndDelete(id);
    if (!item) throw new NotFoundException(`Action item ${id} not found`);
    return item;
  }
}
