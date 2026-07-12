import { Controller, Post, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ProcessingService } from './processing.service';

@ApiTags('processing')
@Controller('meetings/:id')
export class ProcessingController {
  constructor(private readonly processingService: ProcessingService) {}

  @Post('process')
  process(@Param('id') id: string) {
    return this.processingService.processMeeting(id);
  }
}
