import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../services/errorService';
import { AuthRequest } from '../middleware/auth';

/**
 * Submit a rating
 */
export const createRating = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { ratedId, requestId, stars, review } = req.body;

  const request = await prisma.skillRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.status !== 'ACCEPTED') {
    return res.status(400).json({
      success: false,
      message: 'Request not found or not accepted',
    });
  }

  if (request.senderId !== authReq.user!.id && request.receiverId !== authReq.user!.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized to rate this request',
    });
  }

  const existingRating = await prisma.rating.findUnique({
    where: {
      raterId_requestId: {
        raterId: authReq.user!.id,
        requestId,
      },
    },
  });

  if (existingRating) {
    return res.status(409).json({
      success: false,
      message: 'You have already rated this request',
    });
  }

  const rating = await prisma.rating.create({
    data: {
      raterId: authReq.user!.id,
      ratedId,
      requestId,
      stars,
      review,
    },
    include: {
      rater: { select: { id: true, name: true, profilePic: true } },
      rated: { select: { id: true, name: true, profilePic: true } },
    },
  });

  res.status(201).json({
    success: true,
    data: rating,
  });
});

/**
 * Get ratings for a user
 */
export const getUserRatings = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [ratings, total, avgRating] = await Promise.all([
    prisma.rating.findMany({
      where: { ratedId: id },
      skip,
      take: limit,
      include: {
        rater: { select: { id: true, name: true, profilePic: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rating.count({ where: { ratedId: id } }),
    prisma.rating.aggregate({
      where: { ratedId: id },
      _avg: { stars: true },
    }),
  ]);

  res.json({
    success: true,
    data: {
      ratings,
      avgRating: avgRating._avg.stars || 0,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get my given ratings
 */
export const getMyGivenRatings = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [ratings, total] = await Promise.all([
    prisma.rating.findMany({
      where: { raterId: authReq.user!.id },
      skip,
      take: limit,
      include: {
        rated: { select: { id: true, name: true, profilePic: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.rating.count({ where: { raterId: authReq.user!.id } }),
  ]);

  res.json({
    success: true,
    data: {
      ratings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});