import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { SaveUserDto } from './dto/save-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get(':id')
  getUser(@Param('id') id: string) {
    return this.usersService.getUser(id);
  }

  @Post()
  saveUser(@Body() body: SaveUserDto) {
    const { id, token, lat, lon } = body;

    return this.usersService.saveUser(id, token, lat, lon);
  }

  @Put(':id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    const { lat, lon, alarmTime } = body;

    return this.usersService.updateUser(id, lat, lon, alarmTime);
  }

  @Delete(':id')
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(id);
  }
}
