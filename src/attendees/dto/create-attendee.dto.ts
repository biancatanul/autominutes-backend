import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAttendeeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsNotEmpty()
  role: string;

  @IsString()
  @IsNotEmpty()
  meetingId: string;
}
