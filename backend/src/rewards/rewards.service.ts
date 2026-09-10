import { Injectable, Logger, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward, RewardType } from './entities/reward.entity';
import { RewardClaim } from './entities/reward-claim.entity';
import { CreateRewardDto } from './dto/create-reward.dto';
import { ClaimRewardDto } from './dto/claim-reward.dto';

@Injectable()
export class RewardsService {
  private readonly logger = new Logger(RewardsService.name);

  constructor(
    @InjectRepository(Reward)
    private readonly rewardRepository: Repository<Reward>,
    @InjectRepository(RewardClaim)
    private readonly rewardClaimRepository: Repository<RewardClaim>,
  ) {}

  /**
   * Create a new reward
   */
  async createReward(createRewardDto: CreateRewardDto): Promise<Reward> {
    const reward = this.rewardRepository.create({
      ...createRewardDto,
      currentClaims: 0,
    });
    
    return await this.rewardRepository.save(reward);
  }

  /**
   * Get all rewards
   */
  async getAllRewards(): Promise<Reward[]> {
    return await this.rewardRepository.find({
      where: { isActive: true },
      relations: ['claims'],
    });
  }

  /**
   * Get reward by ID
   */
  async getRewardById(id: string): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({
      where: { id },
      relations: ['claims'],
    });

    if (!reward) {
      throw new NotFoundException(`Reward with ID ${id} not found`);
    }

    return reward;
  }

  /**
   * Get reward by challenge ID
   */
  async getRewardByChallengeId(challengeId: string): Promise<Reward> {
    const reward = await this.rewardRepository.findOne({
      where: { challengeId, isActive: true },
      relations: ['claims'],
    });

    if (!reward) {
      throw new NotFoundException(`No active reward found for challenge ${challengeId}`);
    }

    return reward;
  }

  /**
   * Check if user has already claimed a reward for a given challenge
   */
  async hasUserClaimedReward(userId: string, challengeId: string): Promise<boolean> {
    const existingClaim = await this.rewardClaimRepository.findOne({
      where: { userId, challengeId },
    });

    return !!existingClaim;
  }

  /**
   * Claim a reward for a user
   */
  async claimReward(claimRewardDto: ClaimRewardDto): Promise<RewardClaim> {
    const { userId, challengeId } = claimRewardDto;

    try {
      // Check if user has already claimed this reward
      const hasClaimed = await this.hasUserClaimedReward(userId, challengeId);
      if (hasClaimed) {
        this.logger.warn(
          `Reward mint rejected: user ${userId} already claimed the reward for challenge ${challengeId}`,
        );
        throw new ConflictException('Reward already claimed');
      }

      // Get the reward for this challenge
      const reward = await this.getRewardByChallengeId(challengeId);

      // Check if reward is still available (max claims limit)
      if (reward.maxClaims !== null && reward.currentClaims >= reward.maxClaims) {
        this.logger.warn(
          `Reward mint rejected: claim limit reached for reward ${reward.id} (challenge ${challengeId}), requested by user ${userId}`,
        );
        throw new BadRequestException('Reward claim limit reached');
      }

      // Create the claim
      const claim = this.rewardClaimRepository.create({
        userId,
        rewardId: reward.id,
        challengeId,
        status: 'claimed',
      });

      // Save the claim
      const savedClaim = await this.rewardClaimRepository.save(claim);

      // Update the reward's current claims count
      await this.rewardRepository.update(reward.id, {
        currentClaims: reward.currentClaims + 1,
      });

      return savedClaim;
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof NotFoundException
      ) {
        // Already logged above (or self-descriptive, e.g. reward not found) - just rethrow.
        throw error;
      }

      // Unexpected failure (e.g. a database error) - log with full detail before rethrowing.
      this.logger.error(
        `Reward mint failed unexpectedly for user ${userId}, challenge ${challengeId}: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all claims for a user
   */
  async getUserClaims(userId: string): Promise<RewardClaim[]> {
    return await this.rewardClaimRepository.find({
      where: { userId },
      relations: ['reward'],
      order: { claimDate: 'DESC' },
    });
  }

  /**
   * Get claim by ID
   */
  async getClaimById(id: string): Promise<RewardClaim> {
    const claim = await this.rewardClaimRepository.findOne({
      where: { id },
      relations: ['reward'],
    });

    if (!claim) {
      throw new NotFoundException(`Claim with ID ${id} not found`);
    }

    return claim;
  }

  /**
   * Update claim status
   */
  async updateClaimStatus(id: string, status: string): Promise<RewardClaim> {
    const claim = await this.getClaimById(id);
    
    claim.status = status;
    return await this.rewardClaimRepository.save(claim);
  }

  /**
   * Get reward statistics
   */
  async getRewardStats(rewardId: string) {
    const reward = await this.getRewardById(rewardId);
    const totalClaims = await this.rewardClaimRepository.count({
      where: { rewardId },
    });

    return {
      reward,
      totalClaims,
      availableClaims: reward.maxClaims ? reward.maxClaims - totalClaims : null,
      isAvailable: reward.maxClaims ? totalClaims < reward.maxClaims : true,
    };
  }

  /**
   * Delete a reward (soft delete by setting isActive to false)
   */
  async deleteReward(id: string): Promise<void> {
    const reward = await this.getRewardById(id);
    
    // Check if there are any existing claims
    const existingClaims = await this.rewardClaimRepository.count({
      where: { rewardId: id },
    });

    if (existingClaims > 0) {
      throw new BadRequestException('Cannot delete reward with existing claims');
    }

    await this.rewardRepository.update(id, { isActive: false });
  }
} 