import { Global, Module } from '@nestjs/common';
import { JourneyStateService } from './journey-state.service';

@Global()
@Module({
  providers: [JourneyStateService],
  exports: [JourneyStateService],
})
export class JourneyStateModule {}
