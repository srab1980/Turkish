import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiQuery,
  ApiParam 
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { PushNotificationService } from './push-notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../shared/types';
import {
  CreateNotificationDto,
  NotificationQueryDto,
  BulkNotificationDto,
  NotificationStatsDto,
  MarkAsReadDto,
  NotificationPreferencesDto,
  NotificationResponseDto,
} from './dto/notification.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly pushNotificationService: PushNotificationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get user notifications with pagination and filtering' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notifications retrieved successfully',
    type: [NotificationResponseDto]
  })
  @ApiQuery({ name: 'page', required: false, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, description: 'Items per page' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by notification type' })
  @ApiQuery({ name: 'isRead', required: false, description: 'Filter by read status' })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority' })
  async getUserNotifications(
    @Request() req,
    @Query() query: NotificationQueryDto,
  ) {
    return this.notificationsService.getUserNotifications(req.user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics for user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Notification statistics retrieved successfully',
    type: NotificationStatsDto
  })
  async getNotificationStats(@Request() req): Promise<NotificationStatsDto> {
    return this.notificationsService.getNotificationStats(req.user.id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new notification (Admin only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Notification created successfully',
    type: NotificationResponseDto
  })
  @Roles(UserRole.ADMIN, UserRole.INSTRUCTOR)
  @UseGuards(RolesGuard)
  async createNotification(@Body() createNotificationDto: CreateNotificationDto) {
    return this.notificationsService.createNotification(createNotificationDto);
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Send bulk notifications (Admin only)' })
  @ApiResponse({ status: 201, description: 'Bulk notifications sent successfully' })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async sendBulkNotification(@Body() bulkNotificationDto: BulkNotificationDto) {
    const notifications = [];
    
    for (const userId of bulkNotificationDto.userIds) {
      const notification = await this.notificationsService.createNotification({
        userId,
        title: bulkNotificationDto.title,
        message: bulkNotificationDto.message,
        type: bulkNotificationDto.type,
        priority: bulkNotificationDto.priority,
        channels: bulkNotificationDto.channels,
        scheduledFor: bulkNotificationDto.scheduledFor,
        metadata: bulkNotificationDto.metadata,
      });
      notifications.push(notification);
    }

    return {
      message: `Bulk notification sent to ${bulkNotificationDto.userIds.length} users`,
      notifications,
    };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @Param('id', ParseUUIDPipe) notificationId: string,
    @Request() req,
  ) {
    await this.notificationsService.markAsRead(notificationId, req.user.id);
    return { message: 'Notification marked as read' };
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  @HttpCode(HttpStatus.OK)
  async markAllAsRead(@Request() req) {
    await this.notificationsService.markAllAsRead(req.user.id);
    return { message: 'All notifications marked as read' };
  }

  @Put('read-multiple')
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  @HttpCode(HttpStatus.OK)
  async markMultipleAsRead(
    @Body() markAsReadDto: MarkAsReadDto,
    @Request() req,
  ) {
    for (const notificationId of markAsReadDto.notificationIds) {
      await this.notificationsService.markAsRead(notificationId, req.user.id);
    }
    return { 
      message: `${markAsReadDto.notificationIds.length} notifications marked as read` 
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted successfully' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  async deleteNotification(
    @Param('id', ParseUUIDPipe) notificationId: string,
    @Request() req,
  ) {
    await this.notificationsService.deleteNotification(notificationId, req.user.id);
    return { message: 'Notification deleted successfully' };
  }

  // Push notification device management
  @Post('devices/register')
  @ApiOperation({ summary: 'Register device token for push notifications' })
  @ApiResponse({ status: 201, description: 'Device token registered successfully' })
  async registerDevice(
    @Request() req,
    @Body() body: { deviceToken: string; platform: 'android' | 'ios' | 'web' },
  ) {
    await this.pushNotificationService.registerDeviceToken(
      req.user.id,
      body.deviceToken,
      body.platform,
    );
    return { message: 'Device token registered successfully' };
  }

  @Delete('devices/:token')
  @ApiOperation({ summary: 'Unregister device token' })
  @ApiResponse({ status: 200, description: 'Device token unregistered successfully' })
  @ApiParam({ name: 'token', description: 'Device token to unregister' })
  async unregisterDevice(
    @Param('token') deviceToken: string,
    @Request() req,
  ) {
    await this.pushNotificationService.unregisterDeviceToken(req.user.id, deviceToken);
    return { message: 'Device token unregistered successfully' };
  }

  // Topic subscriptions for push notifications
  @Post('topics/:topic/subscribe')
  @ApiOperation({ summary: 'Subscribe to notification topic' })
  @ApiResponse({ status: 201, description: 'Subscribed to topic successfully' })
  @ApiParam({ name: 'topic', description: 'Topic name to subscribe to' })
  async subscribeToTopic(
    @Param('topic') topic: string,
    @Request() req,
  ) {
    await this.pushNotificationService.subscribeToTopic(req.user.id, topic);
    return { message: `Subscribed to topic: ${topic}` };
  }

  @Delete('topics/:topic/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from notification topic' })
  @ApiResponse({ status: 200, description: 'Unsubscribed from topic successfully' })
  @ApiParam({ name: 'topic', description: 'Topic name to unsubscribe from' })
  async unsubscribeFromTopic(
    @Param('topic') topic: string,
    @Request() req,
  ) {
    await this.pushNotificationService.unsubscribeFromTopic(req.user.id, topic);
    return { message: `Unsubscribed from topic: ${topic}` };
  }

  // Admin endpoints
  @Post('admin/send-topic')
  @ApiOperation({ summary: 'Send notification to topic (Admin only)' })
  @ApiResponse({ status: 201, description: 'Topic notification sent successfully' })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async sendTopicNotification(
    @Body() body: { topic: string; title: string; message: string },
  ) {
    // Create a mock notification for topic sending
    const notification = {
      id: 'topic-notification',
      title: body.title,
      message: body.message,
      type: 'system' as any,
      priority: 'medium' as any,
    };

    await this.pushNotificationService.sendTopicNotification(body.topic, notification as any);
    return { message: `Notification sent to topic: ${body.topic}` };
  }

  @Get('admin/all')
  @ApiOperation({ summary: 'Get all notifications (Admin only)' })
  @ApiResponse({ status: 200, description: 'All notifications retrieved successfully' })
  @Roles(UserRole.ADMIN)
  @UseGuards(RolesGuard)
  async getAllNotifications(@Query() query: NotificationQueryDto) {
    // This would need to be implemented in the service to get all notifications
    // For now, return a placeholder response
    return {
      message: 'Admin notification management endpoint',
      note: 'This endpoint would return all system notifications for admin management',
    };
  }

  // Notification preferences (could be moved to user preferences)
  @Get('preferences')
  @ApiOperation({ summary: 'Get user notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences retrieved successfully' })
  async getNotificationPreferences(@Request() req) {
    // This would typically fetch from user preferences
    return {
      emailNotifications: true,
      pushNotifications: true,
      reminderNotifications: true,
      achievementNotifications: true,
      dailyReminderTime: '19:00',
      timezone: 'UTC',
    };
  }

  @Put('preferences')
  @ApiOperation({ summary: 'Update user notification preferences' })
  @ApiResponse({ status: 200, description: 'Notification preferences updated successfully' })
  @HttpCode(HttpStatus.OK)
  async updateNotificationPreferences(
    @Request() req,
    @Body() preferences: NotificationPreferencesDto,
  ) {
    // This would typically update user preferences in the database
    return {
      message: 'Notification preferences updated successfully',
      preferences,
    };
  }
}
