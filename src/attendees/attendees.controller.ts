import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiQuery } from '@nestjs/swagger';
import { AttendeesService } from './attendees.service';
import { CreateAttendeeDto } from './dto/create-attendee.dto';
import { UpdateAttendeeDto } from './dto/update-attendee.dto';

@ApiTags('attendees')
@Controller('attendees')
export class AttendeesController {
  constructor(private readonly attendeesService: AttendeesService) {}

  @Post()
  create(@Body() dto: CreateAttendeeDto) {
    return this.attendeesService.create(dto);
  }

  @Get()
  @ApiQuery({ name: 'meetingId', required: false })
  findAll(@Query('meetingId') meetingId?: string) {
    return this.attendeesService.findAll(meetingId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attendeesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAttendeeDto) {
    return this.attendeesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.attendeesService.remove(id);
  }
}
