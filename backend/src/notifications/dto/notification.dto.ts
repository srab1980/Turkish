import { 
  IsString, 
  IsOptional, 
  IsEnum, 
  IsBoolean, 
  IsDate, 
  IsArray, 
  IsObject, 
  IsUrl,
  IsUUID,
  IsNumber,
  Min,
  Max,
  IsDateString
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  NotificationType, 
  NotificationPriority, 
  NotificationChannel 
} from '../../common/entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ description: 'User ID to send notification to' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Notification message content' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ 
    enum: NotificationType, 
    description: 'Type of notification',
    default: NotificationType.SYSTEM 
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ 
    enum: NotificationPriority, 
    description: 'Priority level',
    default: NotificationPriority.MEDIUM 
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ 
    enum: NotificationChannel,
    isArray: true,
    description: 'Channels to send notification through',
    default: [NotificationChannel.IN_APP]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @ApiPropertyOptional({ description: 'When to send the notification' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledFor?: Date;

  @ApiPropertyOptional({ description: 'When the notification expires' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  expiresAt?: Date;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;

  @ApiPropertyOptional({ description: 'Action URL for the notification' })
  @IsOptional()
  @IsUrl()
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Icon URL for the notification' })
  @IsOptional()
  @IsUrl()
  iconUrl?: string;
}

export class NotificationQueryDto {
  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiPropertyOptional({ enum: NotificationType, description: 'Filter by notification type' })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ description: 'Filter by read status' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isRead?: boolean;

  @ApiPropertyOptional({ enum: NotificationPriority, description: 'Filter by priority' })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ description: 'Start date for filtering' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'End date for filtering' })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

export class BulkNotificationDto {
  @ApiProperty({ description: 'Array of user IDs to send notification to' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  userIds: string[];

  @ApiProperty({ description: 'Notification title' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Notification message content' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ 
    enum: NotificationType, 
    description: 'Type of notification',
    default: NotificationType.SYSTEM 
  })
  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @ApiPropertyOptional({ 
    enum: NotificationPriority, 
    description: 'Priority level',
    default: NotificationPriority.MEDIUM 
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @ApiPropertyOptional({ 
    enum: NotificationChannel,
    isArray: true,
    description: 'Channels to send notification through',
    default: [NotificationChannel.IN_APP]
  })
  @IsOptional()
  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels?: NotificationChannel[];

  @ApiPropertyOptional({ description: 'When to send the notification' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  scheduledFor?: Date;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class NotificationStatsDto {
  @ApiProperty({ description: 'Total number of notifications' })
  total: number;

  @ApiProperty({ description: 'Number of unread notifications' })
  unread: number;

  @ApiProperty({ description: 'Number of read notifications' })
  read: number;

  @ApiProperty({ description: 'Notifications count by type' })
  byType: Record<string, number>;
}

export class MarkAsReadDto {
  @ApiProperty({ description: 'Array of notification IDs to mark as read' })
  @IsArray()
  @IsUUID(undefined, { each: true })
  notificationIds: string[];
}

export class NotificationPreferencesDto {
  @ApiPropertyOptional({ description: 'Enable email notifications' })
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable push notifications' })
  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable reminder notifications' })
  @IsOptional()
  @IsBoolean()
  reminderNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Enable achievement notifications' })
  @IsOptional()
  @IsBoolean()
  achievementNotifications?: boolean;

  @ApiPropertyOptional({ description: 'Daily reminder time (24-hour format)' })
  @IsOptional()
  @IsString()
  dailyReminderTime?: string;

  @ApiPropertyOptional({ description: 'Timezone for scheduling notifications' })
  @IsOptional()
  @IsString()
  timezone?: string;
}

export class NotificationResponseDto {
  @ApiProperty({ description: 'Notification ID' })
  id: string;

  @ApiProperty({ description: 'Notification title' })
  title: string;

  @ApiProperty({ description: 'Notification message' })
  message: string;

  @ApiProperty({ enum: NotificationType, description: 'Notification type' })
  type: NotificationType;

  @ApiProperty({ enum: NotificationPriority, description: 'Priority level' })
  priority: NotificationPriority;

  @ApiProperty({ description: 'Whether notification is read' })
  isRead: boolean;

  @ApiProperty({ description: 'Whether notification is sent' })
  isSent: boolean;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiPropertyOptional({ description: 'Read timestamp' })
  readAt?: Date;

  @ApiPropertyOptional({ description: 'Action URL' })
  actionUrl?: string;

  @ApiPropertyOptional({ description: 'Icon URL' })
  iconUrl?: string;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  metadata?: any;
}
