import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActionItemsService } from './action-items.service';
import { ActionItemsController } from './action-items.controller';
import { ActionItem, ActionItemSchema } from './entities/action-item.entity';
import { MeetingsModule } from '../meetings/meetings.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ActionItem.name, schema: ActionItemSchema }]),
    MeetingsModule,
  ],
  controllers: [ActionItemsController],
  providers: [ActionItemsService],
})
export class ActionItemsModule {}
