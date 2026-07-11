import { IsDateString, IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ActionItemStatus } from '../entities/action-item.entity';

export class CreateActionItemDto {
  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  assignee?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(ActionItemStatus)
  @IsOptional()
  status?: ActionItemStatus;

  @IsMongoId()
  @IsNotEmpty()
  meetingId: string;
}
