import { Module } from '@nestjs/common';
import { AuthModule } from 'src/modules/auth/auth.module';
import { DiaryController } from './controllers/diary.controller';
import { DiaryService } from './services/diary.service';

@Module({
  imports: [AuthModule],
  controllers: [DiaryController],
  providers: [DiaryService],
  exports: [DiaryService],
})
export class DiaryModule {}
