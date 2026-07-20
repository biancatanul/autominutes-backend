import { IsEmail, IsMongoId, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAttendeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  role: string;

  @IsMongoId()
  @IsNotEmpty()
  meetingId: string;
}
