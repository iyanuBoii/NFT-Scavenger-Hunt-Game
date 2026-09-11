import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TimetrialService } from './timetrial.service';
import { TimeTrial } from '../time-trial.entity';

describe('TimetrialService - getLeaderboard', () => {
  let service: TimetrialService;

  const mockTrialRepo = {
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TimetrialService,
        { provide: getRepositoryToken(TimeTrial), useValue: mockTrialRepo },
      ],
    }).compile();

    service = module.get<TimetrialService>(TimetrialService);
  });

  it('orders completions fastest-first and computes pagination', async () => {
    const items = [{ id: '1' }, { id: '2' }];
    mockTrialRepo.findAndCount.mockResolvedValue([items, 25]);

    const result = await service.getLeaderboard('puzzle-1', 2, 10);

    expect(mockTrialRepo.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { puzzleId: 'puzzle-1', completed: true },
        order: { endTime: 'ASC' },
        skip: 10,
        take: 10,
      }),
    );
    expect(result).toEqual({ items, total: 25, page: 2, limit: 10, totalPages: 3 });
  });

  it('returns totalPages 0 when there are no completions', async () => {
    mockTrialRepo.findAndCount.mockResolvedValue([[], 0]);

    const result = await service.getLeaderboard('puzzle-empty');

    expect(result.totalPages).toBe(0);
    expect(result.items).toEqual([]);
  });
});
