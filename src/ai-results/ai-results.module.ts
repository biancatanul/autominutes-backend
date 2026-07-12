import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AiResult, AiResultSchema } from './entities/ai-result.entity';
import { AiResultsService } from './ai-results.service';
import { AiResultsController } from './ai-results.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: AiResult.name, schema: AiResultSchema }])],
  controllers: [AiResultsController],
  providers: [AiResultsService],
})
export class AiResultsModule {}
