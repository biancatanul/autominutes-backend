import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Res,
  UploadedFile,
  UseInterceptors,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import type { Response } from 'express';
import { TranscriptsService } from './transcripts.service';
import { UploadTranscriptDto } from '../meetings/dto/upload-transcript.dto';

@ApiTags('transcripts')
@Controller('meetings')
export class TranscriptsController {
  constructor(private readonly transcripts: TranscriptsService) {}

  @Post(':id/transcript')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 15 * 1024 * 1024 } }))
  uploadFile(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    return this.transcripts.addFileVersion(id, file);
  }

  @Put(':id/transcript')
  saveText(@Param('id') id: string, @Body() dto: UploadTranscriptDto) {
    return this.transcripts.addTextVersion(id, dto.text);
  }

  @Get(':id/transcript')
  getCurrent(@Param('id') id: string) {
    return this.transcripts.getCurrentTranscript(id);
  }

  @Get(':id/transcript/versions')
  async versions(@Param('id') id: string) {
    const versions = await this.transcripts.listVersions(id);
    return { count: versions.length, versions };
  }

  @Get(':id/transcript/versions/:v/download')
  async download(
    @Param('id') id: string,
    @Param('v') v: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const ver = await this.transcripts.getVersion(id, +v);
    if (ver.data && ver.filename) {
      res.set({
        'Content-Type': ver.mimeType ?? 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${ver.filename}"`,
      });
      return new StreamableFile(ver.data);
    }
    res.set({
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': `attachment; filename="transcript-v${ver.version}.txt"`,
    });
    return new StreamableFile(Buffer.from(ver.text, 'utf-8'));
  }
}
