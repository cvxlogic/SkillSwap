import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../services/errorService';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all skills with categories
 */
export const getSkills = asyncHandler(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const category = req.query.category as string;

  const where = category ? { category } : {};

  const [skills, total] = await Promise.all([
    prisma.skill.findMany({
      where,
      skip,
      take: limit,
      orderBy: { name: 'asc' },
    }),
    prisma.skill.count({ where }),
  ]);

  res.json({
    success: true,
    data: {
      skills,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get skill categories
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const categories = await prisma.skill.groupBy({
    by: ['category'],
    _count: { category: true },
  });

  res.json({
    success: true,
    data: categories.map((c) => ({
      name: c.category,
      count: c._count.category,
    })),
  });
});

/**
 * Create a new skill
 */
export const createSkill = asyncHandler(async (req: Request, res: Response) => {
  const { name, category } = req.body;

  const normalizedName = name.toLowerCase().trim();

  const existingSkill = await prisma.skill.findUnique({
    where: { name: normalizedName },
  });

  if (existingSkill) {
    return res.status(409).json({
      success: false,
      message: 'Skill already exists',
    });
  }

  const skill = await prisma.skill.create({
    data: {
      name: normalizedName,
      category: category.toLowerCase().trim(),
    },
  });

  res.status(201).json({
    success: true,
    data: skill,
  });
});

/**
 * Add skill to my profile
 */
export const addMySkill = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { skillId, type, isPaid, price } = req.body;

  const existingUserSkill = await prisma.userSkill.findUnique({
    where: {
      userId_skillId: {
        userId: authReq.user!.id,
        skillId,
      },
    },
  });

  if (existingUserSkill) {
    return res.status(409).json({
      success: false,
      message: 'Skill already added to profile',
    });
  }

  const userSkill = await prisma.userSkill.create({
    data: {
      userId: authReq.user!.id,
      skillId,
      type,
      isPaid: isPaid || false,
      price,
    },
    include: { skill: true },
  });

  res.status(201).json({
    success: true,
    data: userSkill,
  });
});

/**
 * Remove skill from my profile
 */
export const removeMySkill = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { skillId } = req.params;

  await prisma.userSkill.deleteMany({
    where: {
      userId: authReq.user!.id,
      skillId,
    },
  });

  res.json({
    success: true,
    message: 'Skill removed from profile',
  });
});

/**
 * Update my skill
 */
export const updateMySkill = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { skillId } = req.params;
  const { isPaid, price } = req.body;

  const userSkill = await prisma.userSkill.updateMany({
    where: {
      userId: authReq.user!.id,
      skillId,
    },
    data: { isPaid, price },
  });

  if (userSkill.count === 0) {
    return res.status(404).json({
      success: false,
      message: 'Skill not found in your profile',
    });
  }

  const updated = await prisma.userSkill.findFirst({
    where: {
      userId: authReq.user!.id,
      skillId,
    },
    include: { skill: true },
  });

  res.json({
    success: true,
    data: updated,
  });
});

/**
 * Get my skills
 */
export const getMySkills = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const type = req.query.type as 'HAVE' | 'WANT';

  const where: any = { userId: authReq.user!.id };
  if (type) {
    where.type = type;
  }

  const skills = await prisma.userSkill.findMany({
    where,
    include: { skill: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({
    success: true,
    data: skills,
  });
});

/**
 * Get users with a specific skill
 */
export const getUsersBySkill = asyncHandler(async (req: Request, res: Response) => {
  const { skillId } = req.params;
  const type = req.query.type as 'HAVE' | 'WANT';
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const where: any = {
    skillId,
    user: { isSuspended: false },
  };
  if (type) {
    where.type = type;
  }

  const [userSkills, total] = await Promise.all([
    prisma.userSkill.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePic: true,
            bio: true,
            isOnline: true,
            role: true,
            receivedRatings: { select: { stars: true } },
          },
        },
      },
    }),
    prisma.userSkill.count({ where }),
  ]);

  const formattedUsers = userSkills.map((us) => ({
    ...us.user,
    avgRating: us.user.receivedRatings.length > 0
      ? us.user.receivedRatings.reduce((acc, r) => acc + r.stars, 0) / us.user.receivedRatings.length
      : 0,
    ratingsCount: us.user.receivedRatings.length,
    isPaid: us.isPaid,
    price: us.price,
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