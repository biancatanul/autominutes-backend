import { Controller, Get, Post, Body, Patch, Param, Delete, Put, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MeetingsService } from './meetings.service';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { UploadTranscriptDto } from './dto/upload-transcript.dto';

@ApiTags('meetings')
@Controller('meetings')
export class MeetingsController {
  constructor(private readonly meetingsService: MeetingsService) {}

  @Post()
  create(@Body() dto: CreateMeetingDto) {
    return this.meetingsService.create(dto);
  }

  @Get()
  findAll(@Query('page') page = 1, @Query('limit') limit = 10) {
    return this.meetingsService.findAll(+page, +limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMeetingDto) {
    return this.meetingsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingsService.remove(id);
  }

  @Put(':id/transcript')
  setTranscript(@Param('id') id: string, @Body() dto: UploadTranscriptDto) {
    return this.meetingsService.setTranscript(id, dto.text);
  }

  @Get(':id/transcript')
  getTranscript(@Param('id') id: string) {
    return this.meetingsService.getTranscript(id);
  }
}
