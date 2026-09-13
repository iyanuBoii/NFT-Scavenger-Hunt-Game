import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  HttpCode, 
  HttpStatus,
  UseGuards
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  getSchemaPath,
} from '@nestjs/swagger';
import { RewardsService } from './rewards.service';
import { CreateRewardDto } from './dto/create-reward.dto';
import { ClaimRewardDto } from './dto/claim-reward.dto';
import { Reward } from './entities/reward.entity';
import { RewardClaim } from './entities/reward-claim.entity';

@ApiTags('Rewards')
@Controller('rewards')
export class RewardsController {
  constructor(private readonly rewardsService: RewardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new reward' })
  @ApiResponse({ 
    status: 201, 
    description: 'Reward created successfully',
    type: Reward 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid data' 
  })
  async createReward(@Body() createRewardDto: CreateRewardDto): Promise<Reward> {
    return await this.rewardsService.createReward(createRewardDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all active rewards' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of all active rewards',
    type: [Reward] 
  })
  async getAllRewards(): Promise<Reward[]> {
    return await this.rewardsService.getAllRewards();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get reward by ID' })
  @ApiParam({ name: 'id', description: 'Reward ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reward found',
    type: Reward 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Reward not found' 
  })
  async getRewardById(@Param('id') id: string): Promise<Reward> {
    return await this.rewardsService.getRewardById(id);
  }

  @Get('challenge/:challengeId')
  @ApiOperation({ summary: 'Get reward by challenge ID' })
  @ApiParam({ name: 'challengeId', description: 'Challenge ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reward found for challenge',
    type: Reward 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No active reward found for challenge' 
  })
  async getRewardByChallengeId(@Param('challengeId') challengeId: string): Promise<Reward> {
    return await this.rewardsService.getRewardByChallengeId(challengeId);
  }

  @Post('claim')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ 
    summary: 'Claim a reward for a user',
    description: 'Allows a user to claim a reward for completing a specific challenge. Prevents duplicate claims.'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Reward claimed successfully',
    type: RewardClaim 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - invalid data or reward limit reached' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'No active reward found for challenge' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Reward already claimed' 
  })
  async claimReward(@Body() claimRewardDto: ClaimRewardDto): Promise<RewardClaim> {
    return await this.rewardsService.claimReward(claimRewardDto);
  }

  @Get('user/:userId/claims')
  @ApiOperation({ summary: 'Get all claims for a user' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of user claims',
    type: [RewardClaim] 
  })
  async getUserClaims(@Param('userId') userId: string): Promise<RewardClaim[]> {
    return await this.rewardsService.getUserClaims(userId);
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get claim by ID' })
  @ApiParam({ name: 'id', description: 'Claim ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Claim found',
    type: RewardClaim 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Claim not found' 
  })
  async getClaimById(@Param('id') id: string): Promise<RewardClaim> {
    return await this.rewardsService.getClaimById(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get reward statistics' })
  @ApiParam({ name: 'id', description: 'Reward ID' })
  @ApiResponse({
    status: 200,
    description: 'Reward statistics',
    schema: {
      properties: {
        reward: { $ref: getSchemaPath(Reward) },
        totalClaims: { type: 'number', example: 12 },
        availableClaims: {
          type: 'number',
          nullable: true,
          example: 988,
          description: 'null when the reward has no maxClaims limit',
        },
        isAvailable: { type: 'boolean', example: true },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Reward not found'
  })
  async getRewardStats(@Param('id') id: string) {
    return await this.rewardsService.getRewardStats(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a reward (soft delete)' })
  @ApiParam({ name: 'id', description: 'Reward ID' })
  @ApiResponse({ 
    status: 204, 
    description: 'Reward deleted successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Cannot delete reward with existing claims' 
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Reward not found' 
  })
  async deleteReward(@Param('id') id: string): Promise<void> {
    await this.rewardsService.deleteReward(id);
  }
} 