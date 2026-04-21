import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../services/errorService';
import { AuthRequest } from '../middleware/auth';
import { createNotification, createBulkNotifications } from '../services/notificationService';
import { NotificationType } from '@prisma/client';

/**
 * Send a skill request
 */
export const createRequest = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { receiverId, offeredSkill, wantedSkill, type, message } = req.body;

  if (authReq.user!.id === receiverId) {
    return res.status(400).json({
      success: false,
      message: 'Cannot send request to yourself',
    });
  }

  const existingRequest = await prisma.skillRequest.findFirst({
    where: {
      senderId: authReq.user!.id,
      receiverId,
      status: 'PENDING',
    },
  });

  if (existingRequest) {
    return res.status(409).json({
      success: false,
      message: 'Pending request already exists',
    });
  }

  const request = await prisma.skillRequest.create({
    data: {
      senderId: authReq.user!.id,
      receiverId,
      offeredSkill,
      wantedSkill,
      type,
      message,
    },
    include: {
      offeredSkillRef: true,
      wantedSkillRef: true,
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  await createNotification(
    receiverId,
    'REQUEST',
    'New Skill Request',
    `${request.sender.name} wants to exchange skills with you`,
    `/requests/${request.id}`
  );

  res.status(201).json({
    success: true,
    data: request,
  });
});

/**
 * Get incoming requests
 */
export const getIncomingRequests = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.skillRequest.findMany({
      where: { receiverId: authReq.user!.id },
      skip,
      take: limit,
      include: {
        sender: { select: { id: true, name: true, profilePic: true } },
        offeredSkillRef: true,
        wantedSkillRef: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.skillRequest.count({ where: { receiverId: authReq.user!.id } }),
  ]);

  res.json({
    success: true,
    data: {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get outgoing requests
 */
export const getOutgoingRequests = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [requests, total] = await Promise.all([
    prisma.skillRequest.findMany({
      where: { senderId: authReq.user!.id },
      skip,
      take: limit,
      include: {
        receiver: { select: { id: true, name: true, profilePic: true } },
        offeredSkillRef: true,
        wantedSkillRef: true,
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.skillRequest.count({ where: { senderId: authReq.user!.id } }),
  ]);

  res.json({
    success: true,
    data: {
      requests,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Accept a request
 */
export const acceptRequest = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const request = await prisma.skillRequest.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true } },
      receiver: { select: { id: true, name: true } },
    },
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found',
    });
  }

  if (request.receiverId !== authReq.user!.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  if (request.status !== 'PENDING') {
    return res.status(400).json({
      success: false,
      message: 'Request is not pending',
    });
  }

  const updated = await prisma.skillRequest.update({
    where: { id },
    data: { status: 'ACCEPTED' },
  });

  // Create conversation
  const conversation = await prisma.conversation.create({
    data: { requestId: id },
  });

  // Add participants
  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conversation.id, userId: request.senderId },
      { conversationId: conversation.id, userId: request.receiverId },
    ],
  });

  // Send notifications
  await createNotification(
    request.senderId,
    'REQUEST',
    'Request Accepted',
    `${request.receiver.name} accepted your skill request`,
    `/messages/${conversation.id}`
  );

  res.json({
    success: true,
    data: { request: updated, conversation },
  });
});

/**
 * Reject a request
 */
export const rejectRequest = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const request = await prisma.skillRequest.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true } },
    },
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found',
    });
  }

  if (request.receiverId !== authReq.user!.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  const updated = await prisma.skillRequest.update({
    where: { id },
    data: { status: 'REJECTED' },
  });

  await createNotification(
    request.senderId,
    'REQUEST',
    'Request Rejected',
    `${authReq.user!.id} rejected your skill request`,
    '/requests'
  );

  res.json({
    success: true,
    data: updated,
  });
});

/**
 * Cancel a request
 */
export const cancelRequest = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const request = await prisma.skillRequest.findUnique({
    where: { id },
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found',
    });
  }

  if (request.senderId !== authReq.user!.id) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  const updated = await prisma.skillRequest.update({
    where: { id },
    data: { status: 'CANCELLED' },
  });

  res.json({
    success: true,
    data: updated,
  });
});

/**
 * Get request by ID
 */
export const getRequestById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const request = await prisma.skillRequest.findUnique({
    where: { id },
    include: {
      sender: { select: { id: true, name: true, profilePic: true } },
      receiver: { select: { id: true, name: true, profilePic: true } },
      offeredSkillRef: true,
      wantedSkillRef: true,
    },
  });

  if (!request) {
    return res.status(404).json({
      success: false,
      message: 'Request not found',
    });
  }

  res.json({
    success: true,
    data: request,
  });
});