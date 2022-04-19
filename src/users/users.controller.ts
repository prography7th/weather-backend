import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SaveUserDto } from './dto/save-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@ApiTags('User')
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @ApiOperation({ summary: '유저 정보 조회' })
  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @ApiOperation({ summary: '유저 정보 등록' })
  @Post()
  saveUser(@Body() body: SaveUserDto) {
    const { id, token, lat, lon } = body;

    return this.usersService.saveUser(id, token, lat, lon);
  }

  @ApiOperation({ summary: '유저 정보 수정' })
  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const { token, lat, lon } = body;

    return this.usersService.updateUser(id, token, lat, lon);
  }

  @ApiOperation({ summary: '유저 정보 삭제' })
  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }

  @ApiQuery({
    name: 'time',
    required: true,
    type: Number,
    description: '추가할 알람 시간',
  })
  @ApiOperation({ summary: '알람 시간 추가' })
  @Post(':userId/alarmTimes')
  addUserAlarmTime(@Param('userId') userId: string, @Query('time', ParseIntPipe) time: number) {
    return this.usersService.addUserAlarmTime(userId, time);
  }

  @ApiQuery({
    name: 'time',
    required: true,
    type: Number,
    description: '삭제할 알람 시간',
  })
  @ApiOperation({ summary: '알람 시간 삭제' })
  @Delete(':userId/alarmTimes')
  removeUserAlarmTime(@Param('userId') userId: string, @Query('time', ParseIntPipe) time: number) {
    return this.usersService.removeUserAlarmTime(userId, time);
  }
}
