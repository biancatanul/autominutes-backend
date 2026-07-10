import { IsDateString, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateMeetingDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsDateString()
  datetime: string;

  @IsString()
  @IsOptional()
  description?: string;
}
