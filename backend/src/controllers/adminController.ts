import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../services/errorService';

/**
 * Get all users (admin)
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const isSuspended = req.query.suspended as string;
  const role = req.query.role as string;
  const search = req.query.search as string;

  const where: any = {};

  if (isSuspended === 'true') {
    where.isSuspended = true;
  } else if (isSuspended === 'false') {
    where.isSuspended = false;
  }

  if (role) {
    where.role = role;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isSuspended: true,
        isAdmin: true,
        isOnline: true,
        lastSeen: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Suspend user (admin)
 */
export const suspendUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: { isSuspended: true },
    select: {
      id: true,
      name: true,
      email: true,
      isSuspended: true,
    },
  });

  // Log action
  await prisma.auditLog.create({
    data: {
      action: 'SUSPEND_USER',
      resource: 'User',
      resourceId: id,
      details: { reason: req.body.reason },
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Unsuspend user (admin)
 */
export const unsuspendUser = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.update({
    where: { id },
    data: { isSuspended: false },
    select: {
      id: true,
      name: true,
      email: true,
      isSuspended: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      action: 'UNSUSPEND_USER',
      resource: 'User',
      resourceId: id,
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Get platform stats (admin)
 */
export const getStats = asyncHandler(async (req: Request, res: Response) => {
  const [
    totalUsers,
    activeUsers,
    totalRequests,
    completedRequests,
    totalPayments,
    revenue,
    totalRatings,
    pendingReports,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { isOnline: true } }),
    prisma.skillRequest.count(),
    prisma.skillRequest.count({ where: { status: 'ACCEPTED' } }),
    prisma.payment.count({ where: { status: 'COMPLETED' } }),
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),
    prisma.rating.count(),
    prisma.report.count({ where: { status: 'PENDING' } }),
  ]);

  res.json({
    success: true,
    data: {
      totalUsers,
      activeUsers,
      totalRequests,
      completedRequests,
      totalPayments,
      revenue: revenue._sum.amount || 0,
      totalRatings,
      pendingReports,
    },
  });
});

/**
 * Get audit logs (admin)
 */
export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const userId = req.query.userId as string;
  const action = req.query.action as string;

  const where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.auditLog.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      logs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});