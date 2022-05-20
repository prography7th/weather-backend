import { ApiResponseWithDto } from '@app/common/decorators/api-response-with-dto.decorator';
import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ApiBody, ApiNoContentResponse, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { SaveUserDto } from './dto/save-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiResponseWithDto(UserResponseDto)
  @ApiParam({ name: 'id' })
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
  @ApiParam({ name: 'id' })
  @ApiOperation({ summary: '유저 정보 수정' })
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const { token, lat, lon } = body;

    return this.usersService.updateUser(id, token, lat, lon);
  }

  @ApiNoContentResponse()
  @ApiParam({ name: 'id' })
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
    description: '추가할 알람 시간 (0 ~ 23)',
    example: '14',
  })
  @ApiParam({ name: 'userId' })
  @ApiOperation({ summary: '알람 시간 추가' })
  @Post(':userId/alarmTimes')
  addAlarmTime(@Param('userId') userId: string, @Query('time') time: number) {
    return this.usersService.addAlarmTime(userId, time);
  }

  @ApiOperation({ summary: '알람 시간 On/Off' })
  @Put(':userId/alarmTimes/:alarmTimeId')
  switchAlarmTime(@Param('userId') userId: string, @Param('alarmTimeId') alarmTimeId: number) {
    return this.usersService.switchAlarmTime(userId, alarmTimeId);
  }

  @ApiResponseWithDto(UserResponseDto)
  @ApiParam({ name: 'userId' })
  @ApiOperation({ summary: '알람 시간 삭제' })
  @Delete(':userId/alarmTimes/:alarmTimeId')
  removeAlarmTime(@Param('userId') userId: string, @Param('alarmTimeId') alarmTimeId: number) {
    return this.usersService.removeAlarmTime(userId, alarmTimeId);
  }
}
