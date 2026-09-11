import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { TimeTrial } from '../time-trial.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginatedLeaderboardDto } from '../dto/leaderboard-query.dto';

@Injectable()
export class TimetrialService {
    constructor(
    @InjectRepository(TimeTrial)
    private trialRepo: Repository<TimeTrial>,
  ) {}

  private readonly leaderboardCache = new Map<
    string,
    { data: PaginatedLeaderboardDto<TimeTrial>; expiresAt: number }
  >();
  private readonly LEADERBOARD_CACHE_TTL_MS = 30_000;

  async startTrial(userId: string, puzzleId: string): Promise<TimeTrial> {
    const trial = this.trialRepo.create({
      userId,
      puzzleId,
      startTime: new Date(),
    });
    return await this.trialRepo.save(trial);
  }

  async submitTrial(id: string): Promise<TimeTrial> {
    const trial = await this.trialRepo.findOne({ where: { id } });
    if (!trial) throw new NotFoundException('Trial not found');

    const endTime = new Date();
    const timeLimitInMinutes = 5; // configurable
    const diff = (endTime.getTime() - new Date(trial.startTime).getTime()) / 60000;

    if (diff > timeLimitInMinutes) {
      throw new BadRequestException('Time limit exceeded');
    }

    trial.endTime = endTime;
    trial.completed = true;
    const saved = await this.trialRepo.save(trial);
    this.leaderboardCache.clear(); // invalidate: this score may affect any leaderboard page
    return saved;
  }

  async getResults(userId: string): Promise<TimeTrial[]> {
    return await this.trialRepo.find({
      where: { userId },
      relations: ['puzzle'],
      order: { endTime: 'DESC' },
    });
  }

  // Paginated leaderboard: fastest completions first
  async getLeaderboard(
    puzzleId: string,
    page = 1,
    limit = 10,
  ): Promise<PaginatedLeaderboardDto<TimeTrial>> {
    const cacheKey = `${puzzleId}:${page}:${limit}`;
    const cached = this.leaderboardCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const [items, total] = await this.trialRepo.findAndCount({
      where: { puzzleId, completed: true },
      order: { endTime: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    const result = {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    };

    this.leaderboardCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + this.LEADERBOARD_CACHE_TTL_MS,
    });

    return result;
  }
}
