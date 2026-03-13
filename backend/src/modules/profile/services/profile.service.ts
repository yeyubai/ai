import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UpdateProfileRequestDto } from '../dto/update-profile-request.dto';
import { UserProfileDto } from '../dto/user-profile.dto';
import { ProfileRepository } from '../repositories/profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getProfile(userId: bigint): Promise<UserProfileDto> {
    const user = await this.profileRepository.findUserById(userId);
    if (!user) {
      throw new UnauthorizedException('AUTH_EXPIRED');
    }

    const profile = await this.profileRepository.findActiveProfileByUserId(userId);

    if (!profile) {
      return {
        phone: user.phone,
        profileCompleted: user.profileCompleted,
        heightCm: null,
        currentWeightKg: null,
        targetWeightKg: null,
      };
    }

    return {
      phone: user.phone,
      profileCompleted: user.profileCompleted,
      heightCm: profile.heightCm,
      currentWeightKg: Number(profile.currentWeightKg),
      targetWeightKg: Number(profile.targetWeightKg),
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

    return this.getProfile(userId);
  }
}
