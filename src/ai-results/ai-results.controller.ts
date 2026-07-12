import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiResultsService } from './ai-results.service';

@ApiTags('ai-results')
@Controller('meetings/:id/results')
export class AiResultsController {
  constructor(private readonly aiResultsService: AiResultsService) {}

  @Get()
  findForMeeting(@Param('id') id: string) {
    return this.aiResultsService.findByMeeting(id);
  }
}
