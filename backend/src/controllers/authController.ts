import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword, generateOTP } from '../utils/bcrypt';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { sendTypedEmail } from '../services/emailService';
import { createNotification } from '../services/notificationService';
import { AppError, asyncHandler } from '../services/errorService';
import { AuthRequest } from '../middleware/auth';

/**
 * Register new user
 */
export const register = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  const hashedPassword = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role || 'STUDENT',
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: false,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: false,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await sendTypedEmail('welcome', email, {
    name,
    link: `${process.env.FRONTEND_URL}/dashboard`,
  });

  res.status(201).json({
    success: true,
    data: {
      user,
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Login user
 */
export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  if (user.isSuspended) {
    throw new AppError('Account is suspended', 403);
  }

  const isValidPassword = await comparePassword(password, user.password);
  if (!isValidPassword) {
    throw new AppError('Invalid credentials', 401);
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
  });

  await prisma.refreshToken.create({
    data: {
      token: refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { isOnline: true, lastSeen: new Date() },
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
        isAdmin: user.isAdmin,
      },
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Google OAuth authentication
 */
export const googleAuth = asyncHandler(async (req: Request, res: Response) => {
  const { googleToken } = req.body;

  // In production, verify Google token with Google API
  // For now, we'll create a mock verification
  const googleUser = {
    email: 'user@gmail.com',
    name: 'Google User',
    googleId: 'google_123',
  };

  let user = await prisma.user.findFirst({
    where: { googleId: googleUser.googleId },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        name: googleUser.name,
        email: googleUser.email,
        googleId: googleUser.googleId,
        role: 'STUDENT',
      },
    });
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic,
      },
      accessToken,
      refreshToken,
    },
  });
});

/**
 * Refresh access token
 */
export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;

  const storedToken = await prisma.refreshToken.findUnique({
    where: { token },
  });

  if (!storedToken || storedToken.expiresAt < new Date()) {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const payload = verifyRefreshToken(token);

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
  });

  if (!user || user.isSuspended) {
    throw new AppError('User not found or suspended', 401);
  }

  const newAccessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    isAdmin: user.isAdmin,
  });

  res.json({
    success: true,
    data: { accessToken: newAccessToken },
  });
});

/**
 * Logout user
 */
export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  const authReq = req as AuthRequest;

  if (token) {
    await prisma.refreshToken.deleteMany({
      where: { token },
    });
  }

  if (authReq.user) {
    await prisma.user.update({
      where: { id: authReq.user.id },
      data: { isOnline: false },
    });
  }

  res.json({
    success: true,
    message: 'Logged out successfully',
  });
});

/**
 * Forgot password
 */
export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (user) {
    const resetToken = generateAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
    });

    await sendTypedEmail('forgotPassword', email, {
      name: user.name,
      link: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
    });
  }

  res.json({
    success: true,
    message: 'If the email exists, a reset link has been sent',
  });
});

/**
 * Reset password
 */
export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const hashedPassword = await hashPassword(newPassword);

  // Token verification is done in middleware
  const authReq = req as AuthRequest;
  
  await prisma.user.update({
    where: { id: authReq.user!.id },
    data: { password: hashedPassword },
  });

  await prisma.refreshToken.deleteMany({
    where: { userId: authReq.user!.id },
  });

  res.json({
    success: true,
    message: 'Password reset successfully',
  });
});

/**
 * Send OTP for phone verification
 */
export const sendOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone } = req.body;
  const otp = generateOTP();

  // In production, integrate with Twilio
  // await twilioClient.messages.create({
  //   body: `Your SkillSwap OTP is: ${otp}`,
  //   to: phone,
  //   from: config.twilioPhoneNumber,
  // });

  console.log(`OTP for ${phone}: ${otp}`);

  res.json({
    success: true,
    message: 'OTP sent successfully',
  });
});

/**
 * Verify OTP
 */
export const verifyOTP = asyncHandler(async (req: Request, res: Response) => {
  const { phone, otp } = req.body;
  const authReq = req as AuthRequest;

  // In production, verify OTP from Twilio or Redis store
  // For now, accept any 6-digit OTP
  if (otp.length === 6) {
    await prisma.user.update({
      where: { id: authReq.user!.id },
      data: { phone, phoneVerified: true },
    });
  }

  res.json({
    success: true,
    message: 'Phone verified successfully',
  });
});

/**
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  const user = await prisma.user.findUnique({
    where: { id: authReq.user!.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      phoneVerified: true,
      profilePic: true,
      role: true,
      bio: true,
      isOnline: true,
      lastSeen: true,
      createdAt: true,
      userSkills: {
        include: { skill: true },
      },
    },
  });

  res.json({
    success: true,
    data: user,
  });
});

/**
 * Update current user profile
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { name, bio, role } = req.body;

  const user = await prisma.user.update({
    where: { id: authReq.user!.id },
    data: { name, bio, role },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      profilePic: true,
      role: true,
      bio: true,
      updatedAt: true,
    },
  });

  res.json({
    success: true,
    data: user,
  });
});