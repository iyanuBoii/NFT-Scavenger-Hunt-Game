import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { TimetrialService } from './providers/timetrial.service';
import { LeaderboardQueryDto } from './dto/leaderboard-query.dto';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Time Trials')
@Controller('time-trial')
export class TimeTrialController {
  constructor(private readonly timeTrialService: TimetrialService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new time trial for a puzzle' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'string', example: 'user-123' },
        puzzleId: { type: 'string', example: 'puzzle-456' },
      },
      required: ['userId', 'puzzleId'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Time trial started successfully',
  })
  startTrial(@Body() body: { userId: string; puzzleId: string }) {
    return this.timeTrialService.startTrial(body.userId, body.puzzleId);
  }

  @Post('submit/:id')
  @ApiOperation({ summary: 'Submit a time trial attempt' })
  @ApiParam({
    name: 'id',
    description: 'TimeTrial ID',
    example: 'trial-789',
  })
  @ApiResponse({
    status: 200,
    description: 'Time trial submission recorded and validated',
  })
  @ApiResponse({
    status: 400,
    description: 'Time limit exceeded or trial invalid',
  })
  @ApiResponse({
    status: 404,
    description: 'Time trial not found',
  })
  submitTrial(@Param('id') id: string) {
    return this.timeTrialService.submitTrial(id);
  }

  @Get('results/:userId')
  @ApiOperation({ summary: 'Get all time trial results for a user' })
  @ApiParam({
    name: 'userId',
    description: 'User ID to fetch results for',
    example: 'user-123',
  })
  @ApiResponse({
    status: 200,
    description: 'List of time trials completed by the user',
  })
  getUserResults(@Param('userId') userId: string) {
    return this.timeTrialService.getResults(userId);
  }

  @Get('leaderboard/:puzzleId')
  @ApiOperation({ summary: 'Get paginated fastest completions for a puzzle' })
  @ApiParam({
    name: 'puzzleId',
    description: 'Puzzle ID to get leaderboard for',
    example: 'puzzle-456',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'Paginated top performers for the specified puzzle',
  })
  getLeaderboard(
    @Param('puzzleId') puzzleId: string,
    @Query() query: LeaderboardQueryDto,
  ) {
    return this.timeTrialService.getLeaderboard(puzzleId, query.page, query.limit);
  }
}
