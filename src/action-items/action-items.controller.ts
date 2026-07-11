import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { ActionItemsService } from './action-items.service';
import { CreateActionItemDto } from './dto/create-action-item.dto';
import { UpdateActionItemDto } from './dto/update-action-item.dto';

@ApiTags('action-items')
@Controller('action-items')
export class ActionItemsController {
  constructor(private readonly actionItemsService: ActionItemsService) {}

  @Post()
  create(@Body() dto: CreateActionItemDto) {
    return this.actionItemsService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'meetingId', required: false })
  findAll(@Query('meetingId') meetingId?: string) {
    return this.actionItemsService.findAll(meetingId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.actionItemsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateActionItemDto) {
    return this.actionItemsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.actionItemsService.remove(id);
  }
}
