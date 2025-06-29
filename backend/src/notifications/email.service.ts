import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { User } from '../users/entities/user.entity';
import { Notification, NotificationType } from '../common/entities/notification.entity';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const smtpHost = this.configService.get('SMTP_HOST');
    const smtpPort = this.configService.get('SMTP_PORT');
    const smtpUser = this.configService.get('SMTP_USER');
    const smtpPass = this.configService.get('SMTP_PASS');

    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.warn('SMTP configuration not found. Email notifications will be disabled.');
      return;
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(smtpPort) || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // Verify connection
    this.transporter.verify((error, success) => {
      if (error) {
        this.logger.error('SMTP connection failed:', error);
      } else {
        this.logger.log('SMTP server is ready to send emails');
      }
    });
  }

  async sendNotificationEmail(user: User, notification: Notification): Promise<void> {
    if (!this.transporter) {
      this.logger.warn('Email transporter not configured. Skipping email notification.');
      return;
    }

    try {
      const emailContent = this.generateEmailContent(user, notification);
      
      const mailOptions = {
        from: `"Turkish Learning App" <${this.configService.get('SMTP_USER')}>`,
        to: user.email,
        subject: emailContent.subject,
        html: emailContent.html,
        text: emailContent.text,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Email notification sent to ${user.email} for notification ${notification.id}`);
    } catch (error) {
      this.logger.error(`Failed to send email notification to ${user.email}:`, error);
      throw error;
    }
  }

  private generateEmailContent(user: User, notification: Notification): {
    subject: string;
    html: string;
    text: string;
  } {
    const baseUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    const unsubscribeUrl = `${baseUrl}/settings/notifications`;
    
    let subject = notification.title;
    let html = '';
    let text = '';

    switch (notification.type) {
      case NotificationType.ACHIEVEMENT:
        subject = `🏆 ${notification.title}`;
        html = this.generateAchievementEmailHtml(user, notification, baseUrl, unsubscribeUrl);
        text = this.generateAchievementEmailText(user, notification, baseUrl);
        break;

      case NotificationType.STREAK_MILESTONE:
        subject = `🔥 ${notification.title}`;
        html = this.generateStreakEmailHtml(user, notification, baseUrl, unsubscribeUrl);
        text = this.generateStreakEmailText(user, notification, baseUrl);
        break;

      case NotificationType.LEVEL_UP:
        subject = `🎉 ${notification.title}`;
        html = this.generateLevelUpEmailHtml(user, notification, baseUrl, unsubscribeUrl);
        text = this.generateLevelUpEmailText(user, notification, baseUrl);
        break;

      case NotificationType.WEEKLY_GOAL:
        subject = `📊 ${notification.title}`;
        html = this.generateWeeklyGoalEmailHtml(user, notification, baseUrl, unsubscribeUrl);
        text = this.generateWeeklyGoalEmailText(user, notification, baseUrl);
        break;

      default:
        html = this.generateDefaultEmailHtml(user, notification, baseUrl, unsubscribeUrl);
        text = this.generateDefaultEmailText(user, notification, baseUrl);
    }

    return { subject, html, text };
  }

  private generateAchievementEmailHtml(user: User, notification: Notification, baseUrl: string, unsubscribeUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .achievement-badge { background: #ffd700; color: #333; padding: 20px; border-radius: 50%; display: inline-block; font-size: 48px; margin: 20px 0; }
          .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏆 Achievement Unlocked!</h1>
            <p>Congratulations, ${user.firstName}!</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="achievement-badge">🏆</div>
              <h2>${notification.title.replace('🏆 Achievement Unlocked: ', '')}</h2>
              <p style="font-size: 18px;">${notification.message}</p>
            </div>
            <p>You're making excellent progress in your Turkish learning journey! Keep up the fantastic work.</p>
            <div style="text-align: center;">
              <a href="${baseUrl}/dashboard" class="cta-button">View Your Progress</a>
            </div>
          </div>
          <div class="footer">
            <p>Turkish Learning App | <a href="${unsubscribeUrl}">Manage Notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateStreakEmailHtml(user: User, notification: Notification, baseUrl: string, unsubscribeUrl: string): string {
    const streakDays = notification.metadata?.streakDays || 0;
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff6b6b 0%, #ffa500 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .streak-counter { background: #ff6b6b; color: white; padding: 20px; border-radius: 50%; display: inline-block; font-size: 36px; margin: 20px 0; min-width: 80px; }
          .cta-button { background: #ff6b6b; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔥 Streak Milestone!</h1>
            <p>Amazing consistency, ${user.firstName}!</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="streak-counter">${streakDays}</div>
              <h2>Days in a row!</h2>
              <p style="font-size: 18px;">${notification.message}</p>
            </div>
            <p>Your dedication to learning Turkish is truly inspiring. Consistency is key to language mastery!</p>
            <div style="text-align: center;">
              <a href="${baseUrl}/lessons" class="cta-button">Continue Learning</a>
            </div>
          </div>
          <div class="footer">
            <p>Turkish Learning App | <a href="${unsubscribeUrl}">Manage Notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateLevelUpEmailHtml(user: User, notification: Notification, baseUrl: string, unsubscribeUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .level-badge { background: #4ecdc4; color: white; padding: 20px; border-radius: 10px; display: inline-block; font-size: 24px; margin: 20px 0; }
          .cta-button { background: #4ecdc4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Level Up!</h1>
            <p>Congratulations, ${user.firstName}!</p>
          </div>
          <div class="content">
            <div style="text-align: center;">
              <div class="level-badge">Level ${user.level}</div>
              <h2>${notification.title.replace('🎉 ', '')}</h2>
              <p style="font-size: 18px;">${notification.message}</p>
            </div>
            <p>You've reached a new level in your Turkish learning journey! New challenges and opportunities await.</p>
            <div style="text-align: center;">
              <a href="${baseUrl}/courses" class="cta-button">Explore New Content</a>
            </div>
          </div>
          <div class="footer">
            <p>Turkish Learning App | <a href="${unsubscribeUrl}">Manage Notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateWeeklyGoalEmailHtml(user: User, notification: Notification, baseUrl: string, unsubscribeUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .progress-bar { background: #e0e0e0; border-radius: 10px; overflow: hidden; margin: 20px 0; }
          .progress-fill { background: linear-gradient(90deg, #a8edea 0%, #fed6e3 100%); height: 20px; border-radius: 10px; }
          .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📊 Weekly Progress Update</h1>
            <p>Here's how you're doing, ${user.firstName}!</p>
          </div>
          <div class="content">
            <h2>${notification.title.replace('📊 ', '')}</h2>
            <p style="font-size: 18px;">${notification.message}</p>
            <p>Keep up the momentum! Consistent practice is the key to mastering Turkish.</p>
            <div style="text-align: center;">
              <a href="${baseUrl}/dashboard" class="cta-button">View Detailed Progress</a>
            </div>
          </div>
          <div class="footer">
            <p>Turkish Learning App | <a href="${unsubscribeUrl}">Manage Notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private generateDefaultEmailHtml(user: User, notification: Notification, baseUrl: string, unsubscribeUrl: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${notification.title}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #667eea; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .cta-button { background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${notification.title}</h1>
            <p>Hello, ${user.firstName}!</p>
          </div>
          <div class="content">
            <p style="font-size: 18px;">${notification.message}</p>
            ${notification.actionUrl ? `<div style="text-align: center;"><a href="${notification.actionUrl}" class="cta-button">Take Action</a></div>` : ''}
          </div>
          <div class="footer">
            <p>Turkish Learning App | <a href="${unsubscribeUrl}">Manage Notifications</a></p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  // Text versions for email clients that don't support HTML
  private generateAchievementEmailText(user: User, notification: Notification, baseUrl: string): string {
    return `
Achievement Unlocked!

Congratulations, ${user.firstName}!

${notification.title.replace('🏆 Achievement Unlocked: ', '')}
${notification.message}

You're making excellent progress in your Turkish learning journey! Keep up the fantastic work.

View your progress: ${baseUrl}/dashboard

Turkish Learning App
    `;
  }

  private generateStreakEmailText(user: User, notification: Notification, baseUrl: string): string {
    const streakDays = notification.metadata?.streakDays || 0;
    return `
Streak Milestone!

Amazing consistency, ${user.firstName}!

${streakDays} days in a row!
${notification.message}

Your dedication to learning Turkish is truly inspiring. Consistency is key to language mastery!

Continue learning: ${baseUrl}/lessons

Turkish Learning App
    `;
  }

  private generateLevelUpEmailText(user: User, notification: Notification, baseUrl: string): string {
    return `
Level Up!

Congratulations, ${user.firstName}!

Level ${user.level}
${notification.title.replace('🎉 ', '')}
${notification.message}

You've reached a new level in your Turkish learning journey! New challenges and opportunities await.

Explore new content: ${baseUrl}/courses

Turkish Learning App
    `;
  }

  private generateWeeklyGoalEmailText(user: User, notification: Notification, baseUrl: string): string {
    return `
Weekly Progress Update

Here's how you're doing, ${user.firstName}!

${notification.title.replace('📊 ', '')}
${notification.message}

Keep up the momentum! Consistent practice is the key to mastering Turkish.

View detailed progress: ${baseUrl}/dashboard

Turkish Learning App
    `;
  }

  private generateDefaultEmailText(user: User, notification: Notification, baseUrl: string): string {
    return `
${notification.title}

Hello, ${user.firstName}!

${notification.message}

${notification.actionUrl ? `Take action: ${notification.actionUrl}` : ''}

Turkish Learning App
    `;
  }
}
