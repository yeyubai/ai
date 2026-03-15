import { NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/shared/db/prisma.service';
import { DiaryService } from 'src/modules/diary/services/diary.service';

type DiaryEntryDelegate = {
  findMany: jest.Mock;
  findFirst: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
};

type PrismaMock = {
  diaryEntry: DiaryEntryDelegate;
};

function createPrismaMock(): PrismaMock {
  return {
    diaryEntry: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };
}

describe('DiaryService', () => {
  it('lists entries ordered by updatedAt desc', async () => {
    const prisma = createPrismaMock();
    prisma.diaryEntry.findMany.mockResolvedValue([
      {
        id: 2n,
        plainText: 'second entry',
        wordCount: 12,
        createdAt: new Date('2026-03-15T09:00:00.000Z'),
        updatedAt: new Date('2026-03-15T10:00:00.000Z'),
      },
    ]);

    const service = new DiaryService(prisma as unknown as PrismaService);
    const result = await service.listEntries(1n);

    expect(result.entries[0].id).toBe('2');
    expect(result.entries[0].preview).toBe('second entry');
  });

  it('creates a diary entry and computes word count', async () => {
    const prisma = createPrismaMock();
    prisma.diaryEntry.create.mockResolvedValue({
      id: 5n,
      contentHtml: '<p>hello world</p>',
      plainText: 'hello world',
      wordCount: 11,
      createdAt: new Date('2026-03-15T10:00:00.000Z'),
      updatedAt: new Date('2026-03-15T10:00:00.000Z'),
    });

    const service = new DiaryService(prisma as unknown as PrismaService);
    const result = await service.createEntry(1n, {
      contentHtml: '<p>hello world</p>',
      plainText: 'hello world',
    });

    expect(result.wordCount).toBe(11);
    expect(prisma.diaryEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          wordCount: 11,
        }),
      }),
    );
  });

  it('throws when updating a missing diary entry', async () => {
    const prisma = createPrismaMock();
    prisma.diaryEntry.findFirst.mockResolvedValue(null);

    const service = new DiaryService(prisma as unknown as PrismaService);

    await expect(
      service.updateEntry(1n, '99', {
        contentHtml: '<p>x</p>',
        plainText: 'x',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
