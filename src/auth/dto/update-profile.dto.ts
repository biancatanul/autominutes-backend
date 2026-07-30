import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

const ALLOWED_AVATAR_ICONS = ['user', 'smile', 'star', 'heart', 'zap'];

export class UpdateProfileDto {
  @IsOptional()
  @IsNotEmpty()
  @IsString()
  name?: string;

  @IsOptional()
  @IsIn(ALLOWED_AVATAR_ICONS)
  avatarIcon?: string;
}
