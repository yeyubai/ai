import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JourneyStateService } from 'src/shared/state/journey-state.service';
import { UpdateProfileRequestDto } from '../dto/update-profile-request.dto';
import { UserProfileDto } from '../dto/user-profile.dto';
import { ProfileRepository } from '../repositories/profile.repository';

@Injectable()
export class ProfileService {
  constructor(
    private readonly profileRepository: ProfileRepository,
    private readonly journeyState: JourneyStateService,
  ) {}

  async getProfile(userId: bigint): Promise<UserProfileDto> {
    const user = await this.profileRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('AUTH_EXPIRED');
    }

    const profile = await this.profileRepository.findActiveProfileByUserId(userId);
    const extras = this.journeyState.getProfileExtras(userId);

    return {
      phone: user.phone,
      profileCompleted: user.profileCompleted,
      heightCm: profile?.heightCm ?? null,
      currentWeightKg: profile ? Number(profile.currentWeightKg) : null,
      targetWeightKg: profile ? Number(profile.targetWeightKg) : null,
      goalWeeks: extras.goalWeeks,
      workRestPattern: extras.workRestPattern,
      dietPreference: extras.dietPreference,
      activityBaseline: extras.activityBaseline,
      motivationPattern: extras.motivationPattern,
    };
  }

  async updateProfile(
    userId: bigint,
    payload: UpdateProfileRequestDto,
  ): Promise<UserProfileDto> {
    if (payload.targetWeightKg > payload.currentWeightKg) {
      throw new BadRequestException('INVALID_PARAMS');
    }

    const user = await this.profileRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('AUTH_EXPIRED');
    }

    await this.profileRepository.runInTransaction(async (tx) => {
      await this.profileRepository.upsertProfile(tx, {
        userId,
        heightCm: payload.heightCm,
        currentWeightKg: payload.currentWeightKg,
        targetWeightKg: payload.targetWeightKg,
      });
      await this.profileRepository.markProfileCompleted(tx, userId);
    });

    this.journeyState.updateProfileExtras(userId, {
      goalWeeks: payload.goalWeeks,
      workRestPattern: payload.workRestPattern,
      dietPreference: payload.dietPreference,
      activityBaseline: payload.activityBaseline,
      motivationPattern: payload.motivationPattern,
    });

    return this.getProfile(userId);
  }
}
