import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
// import { Auth } from './auth/decorators/auth-decorator';
// import { AuthType } from './auth/enums/auth-type.enum';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  // @Auth(AuthType.None)  //  this route is public
  @Get()
  @ApiOperation({summary: 'Get Hello World Message'})
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  @ApiOperation({ summary: 'Health check for uptime monitoring' })
  getHealth(): { status: string; timestamp: string } {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
