import { ApiResponseWithDto } from '@app/common/decorators/api-response-with-dto.decorator';
import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiNoContentResponse, ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SaveUserDto } from './dto/save-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('test')
  getUserToSendAlarm() {
    return this.usersService.getUserToSendAlarm();
  }

  @ApiResponseWithDto(UserResponseDto)
  @ApiParam({ name: 'id', example: 'a4f35968-dc52-48d6-8068-16a6c600bcce' })
  @ApiOperation({ summary: '유저 정보 조회' })
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @ApiResponseWithDto(UserResponseDto, 201)
  @ApiBody({ type: SaveUserDto })
  @ApiOperation({ summary: '유저 정보 등록' })
  @Post()
  saveUser(@Body() body: SaveUserDto) {
    const { id, token, lat, lon } = body;

    return this.usersService.saveUser(id, token, lat, lon);
  }

  @ApiResponseWithDto(UserResponseDto)
  @ApiParam({ name: 'id', example: 'a4f35968-dc52-48d6-8068-16a6c600bcce' })
  @ApiOperation({ summary: '유저 정보 수정' })
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const { token, lat, lon } = body;

    return this.usersService.updateUser(id, token, lat, lon);
  }

  @ApiNoContentResponse()
  @ApiParam({ name: 'id', example: 'a4f35968-dc52-48d6-8068-16a6c600bcce' })
  @ApiOperation({ summary: '유저 정보 삭제' })
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @ApiResponseWithDto(UserResponseDto, 201)
  @ApiQuery({
    name: 'time',
    required: true,
    type: Number,
    description: '추가할 알람 시간 (0 - 23)',
    example: '14',
  })
  @ApiParam({ name: 'userId', example: 'a4f35968-dc52-48d6-8068-16a6c600bcce' })
  @ApiOperation({ summary: '알람 시간 추가' })
  @Post(':userId/alarmTimes')
  addUserAlarmTime(@Param('userId') userId: string, @Query('time', ParseIntPipe) time: number) {
    return this.usersService.addUserAlarmTime(userId, time);
  }

  @ApiResponseWithDto(UserResponseDto)
  @ApiQuery({
    name: 'time',
    required: true,
    type: Number,
    description: '삭제할 알람 시간 (0 - 23)',
    example: '14',
  })
  @ApiParam({ name: 'userId', example: 'a4f35968-dc52-48d6-8068-16a6c600bcce' })
  @ApiOperation({ summary: '알람 시간 삭제' })
  @Delete(':userId/alarmTimes')
  removeUserAlarmTime(@Param('userId') userId: string, @Query('time', ParseIntPipe) time: number) {
    return this.usersService.removeUserAlarmTime(userId, time);
  }
}
