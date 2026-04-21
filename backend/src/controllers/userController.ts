import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma';
import { asyncHandler } from '../services/errorService';
import { AuthRequest } from '../middleware/auth';
import { uploadToCloudinary, getPublicIdFromUrl } from '../middleware/upload';

/**
 * Get user by ID
 */
export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      profilePic: true,
      role: true,
      bio: true,
      isOnline: true,
      lastSeen: true,
      createdAt: true,
      userSkills: {
        include: { skill: true },
      },
      receivedRatings: {
        include: { rater: { select: { id: true, name: true, profilePic: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!user) {
    return res.status(404).json({
      success: false,
      message: 'User not found',
    });
  }

  // Calculate average rating
  const avgRating = user.receivedRatings.length > 0
    ? user.receivedRatings.reduce((acc, r) => acc + r.stars, 0) / user.receivedRatings.length
    : 0;

  res.json({
    success: true,
    data: { ...user, avgRating },
  });
});

/**
 * Search users
 */
export const searchUsers = asyncHandler(async (req: Request, res: Response) => {
  const { q, skill, role, type, rating } = req.query;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (q) {
    where.OR = [
      { name: { contains: q as string, mode: 'insensitive' } },
      { email: { contains: q as string, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role;
  }

  let skillFilter: any = {};
  if (skill) {
    skillFilter = { skillId: skill };
  }
  if (type) {
    skillFilter.type = type;
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
        profilePic: true,
        role: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        userSkills: {
          where: skillFilter,
          include: { skill: true },
        },
        receivedRatings: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  // Filter by minimum rating if specified
  let filteredUsers = users;
  if (rating) {
    const minRating = parseFloat(rating as string);
    filteredUsers = users.filter((user) => {
      const avgRating = user.receivedRatings.length > 0
        ? user.receivedRatings.reduce((acc, r) => acc + r.stars, 0) / user.receivedRatings.length
        : 0;
      return avgRating >= minRating;
    });
  }

  const formattedUsers = filteredUsers.map((user) => ({
    ...user,
    avgRating: user.receivedRatings.length > 0
      ? user.receivedRatings.reduce((acc, r) => acc + r.stars, 0) / user.receivedRatings.length
      : 0,
    ratingsCount: user.receivedRatings.length,
    receivedRatings: undefined,
  }));

  res.json({
    success: true,
    data: {
      users: formattedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Upload avatar
 */
export const uploadAvatar = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'No file uploaded',
    });
  }

  const user = await prisma.user.update({
    where: { id: authReq.user!.id },
    data: { profilePic: req.file.path },
    select: {
      id: true,
      name: true,
      profilePic: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Get recommended teachers based on user's WANT skills
 */
export const getRecommendedTeachers = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  // Get user's WANT skills
  const userWantSkills = await prisma.userSkill.findMany({
    where: { userId: authReq.user!.id, type: 'WANT' },
    select: { skillId: true },
  });

  const wantedSkillIds = userWantSkills.map((us) => us.skillId);

  if (wantedSkillIds.length === 0) {
    return res.json({
      success: true,
      data: {
        users: [],
        total: 0,
        page,
        totalPages: 0,
      },
    });
  }

  // Find teachers who have these skills as HAVE
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        role: 'TEACHER',
        isSuspended: false,
        userSkills: {
          some: {
            skillId: { in: wantedSkillIds },
            type: 'HAVE',
          },
        },
      },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        profilePic: true,
        bio: true,
        isOnline: true,
        lastSeen: true,
        userSkills: {
          where: { type: 'HAVE' },
          include: { skill: true },
        },
        receivedRatings: {
          select: { stars: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.user.count({
      where: {
        role: 'TEACHER',
        isSuspended: false,
        userSkills: {
          some: {
            skillId: { in: wantedSkillIds },
            type: 'HAVE',
          },
        },
      },
    }),
  ]);

  const formattedUsers = users.map((user) => ({
    ...user,
    avgRating: user.receivedRatings.length > 0
      ? user.receivedRatings.reduce((acc, r) => acc + r.stars, 0) / user.receivedRatings.length
      : 0,
    ratingsCount: user.receivedRatings.length,
    receivedRatings: undefined,
  }));

  res.json({
    success: true,
    data: {
      users: formattedUsers,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});