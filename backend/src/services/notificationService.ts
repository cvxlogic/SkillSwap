import { NotificationType } from '@prisma/client';
import prisma from '../utils/prisma';
import { getSocketService } from './socketService';

/**
 * Creates a notification and optionally sends real-time notification
 */
export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  body: string,
  link?: string
) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      body,
      link,
    },
  });

  // Send real-time notification
  const socketService = getSocketService();
  if (socketService) {
    socketService.emitNotification(userId, notification);
  }

  return notification;
}

/**
 * Creates multiple notifications at once
 */
export async function createBulkNotifications(
  notifications: Array<{
    userId: string;
    type: NotificationType;
    title: string;
    body: string;
    link?: string;
  }>
) {
  const created = await prisma.notification.createMany({
    data: notifications,
  });

  // Send real-time notifications
  const socketService = getSocketService();
  if (socketService) {
    notifications.forEach((n) => {
      socketService.emitNotification(n.userId, { ...n, createdAt: new Date() });
    });
  }

  return created;
}

/**
 * Gets notifications for a user
 */
export async function getUserNotifications(
  userId: string,
  page: number = 1,
  limit: number = 20
) {
  const skip = (page - 1) * limit;

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.notification.count({ where: { userId } }),
  ]);

  return {
    notifications,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * Marks a notification as read
 */
export async function markAsRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}

/**
 * Marks all notifications as read for a user
 */
export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}

/**
 * Gets unread notification count for a user
 */
export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, read: false },
  });
}

/**
 * Deletes old notifications (cleanup utility)
 */
export async function deleteOldNotifications(daysOld: number = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  return prisma.notification.deleteMany({
    where: {
      createdAt: { lt: cutoffDate },
      read: true,
    },
  });
}

export default {
  createNotification,
  createBulkNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount,
  deleteOldNotifications,
};