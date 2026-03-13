import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import { CurrentUserId } from 'src/modules/auth/decorators/current-user-id.decorator';
import { SessionAuthGuard } from 'src/modules/auth/guards/session-auth.guard';
import { UpdateProfileRequestDto } from '../dto/update-profile-request.dto';
import { UserProfileDto } from '../dto/user-profile.dto';
import { ProfileService } from '../services/profile.service';

@Controller('profile')
@UseGuards(SessionAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getProfile(@CurrentUserId() userId: bigint): Promise<UserProfileDto> {
    return this.profileService.getProfile(userId);
  }

  @Put()
  updateProfile(
    @CurrentUserId() userId: bigint,
    @Body() payload: UpdateProfileRequestDto,
  ): Promise<UserProfileDto> {
    return this.profileService.updateProfile(userId, payload);
  }
}
