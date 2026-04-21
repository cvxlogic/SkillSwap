import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../services/errorService';
import { AuthRequest } from '../middleware/auth';

/**
 * Get notifications
 */
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: authReq.user!.id },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId: authReq.user!.id } }),
    prisma.notification.count({
      where: { userId: authReq.user!.id, read: false },
    }),
  ]);

  res.json({
    success: true,
    data: {
      notifications,
      unreadCount,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Mark notification as read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  await prisma.notification.updateMany({
    where: { id, userId: authReq.user!.id },
    data: { read: true },
  });

  res.json({
    success: true,
    message: 'Notification marked as read',
  });
});

/**
 * Mark all notifications as read
 */
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  await prisma.notification.updateMany({
    where: { userId: authReq.user!.id, read: false },
    data: { read: true },
  });

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

/**
 * Get unread count
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  const count = await prisma.notification.count({
    where: { userId: authReq.user!.id, read: false },
  });

  res.json({
    success: true,
    data: { unreadCount: count },
  });
});

/**
 * Delete notification
 */
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  await prisma.notification.deleteMany({
    where: { id, userId: authReq.user!.id },
  });

  res.json({
    success: true,
    message: 'Notification deleted',
  });
});