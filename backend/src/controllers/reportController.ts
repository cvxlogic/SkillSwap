import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../services/errorService';
import { AuthRequest } from '../middleware/auth';

/**
 * Create a report
 */
export const createReport = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { reportedId, reason, description } = req.body;

  if (authReq.user!.id === reportedId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot report yourself',
    });
  }

  const existingReport = await prisma.report.findFirst({
    where: {
      reporterId: authReq.user!.id,
      reportedId,
      status: 'PENDING',
    },
  });

  if (existingReport) {
    return res.status(409).json({
      success: false,
      message: 'You have already reported this user',
    });
  }

  const report = await prisma.report.create({
    data: {
      reporterId: authReq.user!.id,
      reportedId,
      reason,
      description,
    },
    include: {
      reporter: { select: { id: true, name: true } },
      reported: { select: { id: true, name: true } },
    },
  });

  res.status(201).json({
    success: true,
    data: report,
  });
});

/**
 * Get all reports (admin)
 */
export const getAllReports = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const status = req.query.status as string;

  const where = status ? { status: status as any } : {};

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      skip,
      take: limit,
      include: {
        reporter: { select: { id: true, name: true, profilePic: true } },
        reported: { select: { id: true, name: true, profilePic: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.report.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      reports,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Update report (admin)
 */
export const updateReport = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, adminNote } = req.body;

  const report = await prisma.report.update({
    where: { id },
    data: {
      status,
      adminNote,
    },
    include: {
      reporter: { select: { id: true, name: true } },
      reported: { select: { id: true, name: true } },
    },
  });

  res.json({
    success: true,
    data: report,
  });
});