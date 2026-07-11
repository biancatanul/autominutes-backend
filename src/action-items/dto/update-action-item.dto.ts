import { PartialType } from '@nestjs/swagger';
import { CreateActionItemDto } from './create-action-item.dto';

// reuses CreateActionItemDto but makes every field optional since updates may only change just one field
export class UpdateActionItemDto extends PartialType(CreateActionItemDto) {}
