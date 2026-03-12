import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async upsertUserByPhone(phone: string): Promise<void> {
    await this.prisma.user.upsert({
      where: { externalId: phone },
      update: {},
      create: { externalId: phone },
    });
  }
}
