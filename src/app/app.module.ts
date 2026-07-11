import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { AppService } from './app.service';
import { UsersModule } from '@users/users.module';
import { MeetingsModule } from '../meetings/meetings.module';
import { AttendeesModule } from '../attendees/attendees.module';
import { ActionItemsModule } from '../action-items/action-items.module';

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
    UsersModule,
    MeetingsModule,
    AttendeesModule,
    ActionItemsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
