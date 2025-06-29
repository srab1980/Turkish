import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Notification, NotificationType } from '../common/entities/notification.entity';

// Mock Firebase Admin SDK interface for development
interface FirebaseMessage {
  token?: string;
  topic?: string;
  condition?: string;
  notification?: {
    title: string;
    body: string;
    imageUrl?: string;
  };
  data?: Record<string, string>;
  android?: {
    notification?: {
      icon?: string;
      color?: string;
      sound?: string;
      tag?: string;
      clickAction?: string;
    };
  };
  apns?: {
    payload?: {
      aps?: {
        badge?: number;
        sound?: string;
        category?: string;
      };
    };
  };
  webpush?: {
    notification?: {
      icon?: string;
      badge?: string;
      actions?: Array<{
        action: string;
        title: string;
        icon?: string;
      }>;
    };
  };
}

@Injectable()
export class PushNotificationService {
  private readonly logger = new Logger(PushNotificationService.name);
  private firebaseAdmin: any;
  private isFirebaseInitialized = false;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private async initializeFirebase() {
    try {
      // In production, you would initialize Firebase Admin SDK here
      const firebaseConfig = this.configService.get('FIREBASE_SERVICE_ACCOUNT_KEY');
      
      if (!firebaseConfig) {
        this.logger.warn('Firebase configuration not found. Push notifications will use mock implementation.');
        return;
      }

      // Mock Firebase initialization for development
      // In production, uncomment and configure:
      /*
      const admin = require('firebase-admin');
      const serviceAccount = JSON.parse(firebaseConfig);
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
      
      this.firebaseAdmin = admin;
      this.isFirebaseInitialized = true;
      */
      
      this.logger.log('Firebase Admin SDK initialized (mock mode)');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  async sendPushNotification(user: User, notification: Notification): Promise<void> {
    try {
      // Get user's device tokens (would be stored in database)
      const deviceTokens = await this.getUserDeviceTokens(user.id);
      
      if (deviceTokens.length === 0) {
        this.logger.warn(`No device tokens found for user ${user.id}`);
        return;
      }

      const message = this.buildPushMessage(notification, deviceTokens[0]);
      
      if (this.isFirebaseInitialized && this.firebaseAdmin) {
        // Send via Firebase in production
        const response = await this.firebaseAdmin.messaging().send(message);
        this.logger.log(`Push notification sent successfully: ${response}`);
      } else {
        // Mock implementation for development
        this.logger.log(`Mock push notification sent to user ${user.id}:`, {
          title: message.notification?.title,
          body: message.notification?.body,
          data: message.data
        });
      }
    } catch (error) {
      this.logger.error(`Failed to send push notification to user ${user.id}:`, error);
      throw error;
    }
  }

  async sendBulkPushNotification(userIds: string[], notification: Notification): Promise<void> {
    try {
      const allDeviceTokens = [];
      
      // Collect all device tokens
      for (const userId of userIds) {
        const tokens = await this.getUserDeviceTokens(userId);
        allDeviceTokens.push(...tokens);
      }

      if (allDeviceTokens.length === 0) {
        this.logger.warn('No device tokens found for bulk notification');
        return;
      }

      const message = this.buildBulkPushMessage(notification, allDeviceTokens);
      
      if (this.isFirebaseInitialized && this.firebaseAdmin) {
        // Send via Firebase in production
        const response = await this.firebaseAdmin.messaging().sendMulticast(message);
        this.logger.log(`Bulk push notification sent: ${response.successCount} successful, ${response.failureCount} failed`);
      } else {
        // Mock implementation for development
        this.logger.log(`Mock bulk push notification sent to ${userIds.length} users:`, {
          title: message.notification?.title,
          body: message.notification?.body,
          tokenCount: allDeviceTokens.length
        });
      }
    } catch (error) {
      this.logger.error('Failed to send bulk push notification:', error);
      throw error;
    }
  }

  private buildPushMessage(notification: Notification, deviceToken: string): FirebaseMessage {
    const baseMessage: FirebaseMessage = {
      token: deviceToken,
      notification: {
        title: notification.title,
        body: notification.message || '',
      },
      data: {
        notificationId: notification.id,
        type: notification.type,
        priority: notification.priority,
        ...(notification.metadata && { metadata: JSON.stringify(notification.metadata) }),
        ...(notification.actionUrl && { actionUrl: notification.actionUrl }),
      },
    };

    // Customize based on notification type
    switch (notification.type) {
      case NotificationType.ACHIEVEMENT:
        baseMessage.notification!.imageUrl = notification.iconUrl || '/icons/achievement.png';
        baseMessage.android = {
          notification: {
            icon: 'achievement_icon',
            color: '#FFD700',
            sound: 'achievement_sound',
            tag: 'achievement',
          }
        };
        baseMessage.apns = {
          payload: {
            aps: {
              badge: 1,
              sound: 'achievement.wav',
              category: 'ACHIEVEMENT_CATEGORY',
            }
          }
        };
        break;

      case NotificationType.STREAK_MILESTONE:
        baseMessage.notification!.imageUrl = notification.iconUrl || '/icons/streak.png';
        baseMessage.android = {
          notification: {
            icon: 'streak_icon',
            color: '#FF6B6B',
            sound: 'streak_sound',
            tag: 'streak',
          }
        };
        baseMessage.apns = {
          payload: {
            aps: {
              badge: 1,
              sound: 'streak.wav',
              category: 'STREAK_CATEGORY',
            }
          }
        };
        break;

      case NotificationType.REMINDER:
        baseMessage.android = {
          notification: {
            icon: 'reminder_icon',
            color: '#667EEA',
            sound: 'default',
            tag: 'daily_reminder',
          }
        };
        baseMessage.apns = {
          payload: {
            aps: {
              sound: 'default',
              category: 'REMINDER_CATEGORY',
            }
          }
        };
        break;

      case NotificationType.LEVEL_UP:
        baseMessage.notification!.imageUrl = notification.iconUrl || '/icons/level_up.png';
        baseMessage.android = {
          notification: {
            icon: 'level_up_icon',
            color: '#4ECDC4',
            sound: 'level_up_sound',
            tag: 'level_up',
          }
        };
        baseMessage.apns = {
          payload: {
            aps: {
              badge: 1,
              sound: 'level_up.wav',
              category: 'LEVEL_UP_CATEGORY',
            }
          }
        };
        break;

      default:
        baseMessage.android = {
          notification: {
            icon: 'default_icon',
            color: '#667EEA',
            sound: 'default',
          }
        };
    }

    // Add web push configuration
    baseMessage.webpush = {
      notification: {
        icon: notification.iconUrl || '/icons/app-icon-192.png',
        badge: '/icons/badge-72.png',
        ...(notification.actionUrl && {
          actions: [{
            action: 'open',
            title: 'Open App',
          }]
        })
      }
    };

    return baseMessage;
  }

  private buildBulkPushMessage(notification: Notification, deviceTokens: string[]): any {
    const message = this.buildPushMessage(notification, '');
    delete message.token; // Remove single token
    
    return {
      ...message,
      tokens: deviceTokens,
    };
  }

  private async getUserDeviceTokens(userId: string): Promise<string[]> {
    // In a real implementation, you would fetch device tokens from the database
    // For now, return mock tokens for development
    return [`mock_token_${userId}_android`, `mock_token_${userId}_ios`];
  }

  async registerDeviceToken(userId: string, deviceToken: string, platform: 'android' | 'ios' | 'web'): Promise<void> {
    try {
      // In production, store device token in database
      // For now, just log it
      this.logger.log(`Device token registered for user ${userId} on ${platform}: ${deviceToken.substring(0, 20)}...`);
      
      // You would implement database storage here:
      /*
      await this.deviceTokenRepository.upsert({
        userId,
        token: deviceToken,
        platform,
        isActive: true,
        lastUsed: new Date(),
      }, ['userId', 'token']);
      */
    } catch (error) {
      this.logger.error(`Failed to register device token for user ${userId}:`, error);
      throw error;
    }
  }

  async unregisterDeviceToken(userId: string, deviceToken: string): Promise<void> {
    try {
      // In production, mark device token as inactive in database
      this.logger.log(`Device token unregistered for user ${userId}: ${deviceToken.substring(0, 20)}...`);
      
      // You would implement database update here:
      /*
      await this.deviceTokenRepository.update(
        { userId, token: deviceToken },
        { isActive: false }
      );
      */
    } catch (error) {
      this.logger.error(`Failed to unregister device token for user ${userId}:`, error);
      throw error;
    }
  }

  async sendTopicNotification(topic: string, notification: Notification): Promise<void> {
    try {
      const message: FirebaseMessage = {
        topic,
        notification: {
          title: notification.title,
          body: notification.message || '',
        },
        data: {
          notificationId: notification.id,
          type: notification.type,
          priority: notification.priority,
        },
      };

      if (this.isFirebaseInitialized && this.firebaseAdmin) {
        const response = await this.firebaseAdmin.messaging().send(message);
        this.logger.log(`Topic notification sent to ${topic}: ${response}`);
      } else {
        this.logger.log(`Mock topic notification sent to ${topic}:`, {
          title: message.notification?.title,
          body: message.notification?.body,
        });
      }
    } catch (error) {
      this.logger.error(`Failed to send topic notification to ${topic}:`, error);
      throw error;
    }
  }

  async subscribeToTopic(userId: string, topic: string): Promise<void> {
    try {
      const deviceTokens = await this.getUserDeviceTokens(userId);
      
      if (this.isFirebaseInitialized && this.firebaseAdmin) {
        await this.firebaseAdmin.messaging().subscribeToTopic(deviceTokens, topic);
        this.logger.log(`User ${userId} subscribed to topic ${topic}`);
      } else {
        this.logger.log(`Mock subscription: User ${userId} subscribed to topic ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Failed to subscribe user ${userId} to topic ${topic}:`, error);
      throw error;
    }
  }

  async unsubscribeFromTopic(userId: string, topic: string): Promise<void> {
    try {
      const deviceTokens = await this.getUserDeviceTokens(userId);
      
      if (this.isFirebaseInitialized && this.firebaseAdmin) {
        await this.firebaseAdmin.messaging().unsubscribeFromTopic(deviceTokens, topic);
        this.logger.log(`User ${userId} unsubscribed from topic ${topic}`);
      } else {
        this.logger.log(`Mock unsubscription: User ${userId} unsubscribed from topic ${topic}`);
      }
    } catch (error) {
      this.logger.error(`Failed to unsubscribe user ${userId} from topic ${topic}:`, error);
      throw error;
    }
  }
}
