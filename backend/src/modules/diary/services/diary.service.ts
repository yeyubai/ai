import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';
import { CreateDiaryEntryRequestDto } from '../dto/create-diary-entry-request.dto';
import { DiaryEntryDetailDto } from '../dto/diary-entry-detail.dto';
import { DiaryEntryListResponseDto } from '../dto/diary-entry-list-response.dto';
import { DiaryEntrySummaryDto } from '../dto/diary-entry-summary.dto';
import { UpdateDiaryEntryRequestDto } from '../dto/update-diary-entry-request.dto';

type StoredDiaryEntry = {
  id: bigint;
  contentHtml: string;
  plainText: string;
  wordCount: number;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class DiaryService {
  constructor(private readonly prisma: PrismaService) {}

  async listEntries(userId: bigint): Promise<DiaryEntryListResponseDto> {
    const rows = await this.prisma.diaryEntry.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
      take: 50,
      select: {
        id: true,
        plainText: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      entries: rows.map((row) => this.toSummaryDto(row)),
    };
  }

  async getEntry(userId: bigint, entryId: string): Promise<DiaryEntryDetailDto> {
    const targetId = this.parseEntryId(entryId);
    const row = await this.prisma.diaryEntry.findFirst({
      where: { id: targetId, userId, deletedAt: null },
      select: {
        id: true,
        contentHtml: true,
        plainText: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!row) {
      throw new NotFoundException('INVALID_PARAMS');
    }

    return this.toDetailDto(row);
  }

  async createEntry(
    userId: bigint,
    payload: CreateDiaryEntryRequestDto,
  ): Promise<DiaryEntryDetailDto> {
    const normalized = this.normalizePayload(payload);
    const row = await this.prisma.diaryEntry.create({
      data: {
        userId,
        contentHtml: normalized.contentHtml,
        plainText: normalized.plainText,
        wordCount: normalized.wordCount,
      },
      select: {
        id: true,
        contentHtml: true,
        plainText: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.toDetailDto(row);
  }

  async updateEntry(
    userId: bigint,
    entryId: string,
    payload: UpdateDiaryEntryRequestDto,
  ): Promise<DiaryEntryDetailDto> {
    const targetId = this.parseEntryId(entryId);
    const existing = await this.prisma.diaryEntry.findFirst({
      where: { id: targetId, userId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw new NotFoundException('INVALID_PARAMS');
    }

    const normalized = this.normalizePayload(payload);
    const row = await this.prisma.diaryEntry.update({
      where: { id: targetId },
      data: {
        contentHtml: normalized.contentHtml,
        plainText: normalized.plainText,
        wordCount: normalized.wordCount,
      },
      select: {
        id: true,
        contentHtml: true,
        plainText: true,
        wordCount: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return this.toDetailDto(row);
  }

  private parseEntryId(entryId: string): bigint {
    try {
      return BigInt(entryId);
    } catch {
      throw new NotFoundException('INVALID_PARAMS');
    }
  }

  private normalizePayload(
    payload: CreateDiaryEntryRequestDto | UpdateDiaryEntryRequestDto,
  ): { contentHtml: string; plainText: string; wordCount: number } {
    const contentHtml = payload.contentHtml.trim();
    const plainText = payload.plainText.replace(/\s+/g, ' ').trim();

    return {
      contentHtml: contentHtml || '<p></p>',
      plainText,
      wordCount: plainText.length,
    };
  }

  private toSummaryDto(
    row: Pick<StoredDiaryEntry, 'id' | 'plainText' | 'wordCount' | 'createdAt' | 'updatedAt'>,
  ): DiaryEntrySummaryDto {
    return {
      id: row.id.toString(),
      preview: row.plainText.slice(0, 72) || '空白日记',
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      wordCount: row.wordCount,
    };
  }

  private toDetailDto(row: StoredDiaryEntry): DiaryEntryDetailDto {
    return {
      id: row.id.toString(),
      contentHtml: row.contentHtml,
      plainText: row.plainText,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      wordCount: row.wordCount,
    };
  }
}
