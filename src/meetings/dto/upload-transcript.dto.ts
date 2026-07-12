import { IsNotEmpty, IsString } from 'class-validator';

export class UploadTranscriptDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
