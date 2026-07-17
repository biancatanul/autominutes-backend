import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { MeetingsModule } from '../meetings/meetings.module';
import { AttendeesModule } from '../attendees/attendees.module';
import { ActionItemsModule } from '../action-items/action-items.module';
import { AiResultsModule } from '../ai-results/ai-results.module';
import { ProcessingModule } from '../processing/processing.module';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MeetingsModule,
    AttendeesModule,
    ActionItemsModule,
    AiResultsModule,
    ProcessingModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
