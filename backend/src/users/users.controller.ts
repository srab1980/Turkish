import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto, UpdatePreferencesDto } from './dto/update-user.dto';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Put('profile')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  async updateProfile(@Request() req, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(req.user.id, updateUserDto);
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get user preferences' })
  @ApiResponse({ status: 200, description: 'User preferences retrieved successfully' })
  async getPreferences(@Request() req) {
    return this.usersService.getUserPreferences(req.user.id);
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user preferences' })
  @ApiResponse({ status: 200, description: 'Preferences updated successfully' })
  async updatePreferences(@Request() req, @Body() updatePreferencesDto: UpdatePreferencesDto) {
    return this.usersService.updatePreferences(req.user.id, updatePreferencesDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getStats(@Request() req) {
    return this.usersService.getUserStats(req.user.id);
  }

  @Get('activity')
  @ApiOperation({ summary: 'Get user activity history' })
  @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
  async getActivity(@Request() req) {
    return this.usersService.getUserActivity(req.user.id);
  }

  @Get('achievements')
  @ApiOperation({ summary: 'Get user achievements' })
  @ApiResponse({ status: 200, description: 'User achievements retrieved successfully' })
  async getAchievements(@Request() req) {
    return this.usersService.getUserAchievements(req.user.id);
  }

  @Put('level')
  @ApiOperation({ summary: 'Update user CEFR level' })
  @ApiResponse({ status: 200, description: 'User level updated successfully' })
  async updateLevel(@Request() req, @Body() levelData: { level: string }) {
    return this.usersService.updateUserLevel(req.user.id, levelData.level);
  }

  @Delete('account')
  @ApiOperation({ summary: 'Deactivate user account' })
  @ApiResponse({ status: 200, description: 'Account deactivated successfully' })
  async deactivateAccount(@Request() req) {
    await this.usersService.deactivateAccount(req.user.id);
    return { message: 'Account deactivated successfully' };
  }
}
