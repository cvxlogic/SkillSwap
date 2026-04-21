import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { asyncHandler } from '../services/errorService';
import { AuthRequest } from '../middleware/auth';

/**
 * Get all conversations for current user
 */
export const getConversations = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: authReq.user!.id },
        },
      },
      skip,
      take: limit,
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, profilePic: true, isOnline: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    }),
    prisma.conversation.count({
      where: {
        participants: {
          some: { userId: authReq.user!.id },
        },
      },
    }),
  ]);

  const formattedConversations = conversations.map((conv) => ({
    id: conv.id,
    lastMessage: conv.messages[0] || null,
    participants: conv.participants.map((p) => p.user),
    updatedAt: conv.updatedAt,
  }));

  res.json({
    success: true,
    data: {
      conversations: formattedConversations,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Get conversation by ID
 */
export const getConversationById = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 50;
  const skip = (page - 1) * limit;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, profilePic: true, isOnline: true },
          },
        },
      },
    },
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found',
    });
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === authReq.user!.id
  );

  if (!isParticipant) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: id },
      skip,
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, profilePic: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.message.count({ where: { conversationId: id } }),
  ]);

  res.json({
    success: true,
    data: {
      conversation,
      messages: messages.reverse(),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Send a message
 */
export const sendMessage = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;
  const { content, type } = req.body;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: true,
    },
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found',
    });
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === authReq.user!.id
  );

  if (!isParticipant) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  const message = await prisma.message.create({
    data: {
      conversationId: id,
      senderId: authReq.user!.id,
      content,
      type: type || 'TEXT',
    },
    include: {
      sender: {
        select: { id: true, name: true, profilePic: true },
      },
    },
  });

  // Update conversation timestamp
  await prisma.conversation.update({
    where: { id },
    data: { updatedAt: new Date() },
  });

  res.status(201).json({
    success: true,
    data: message,
  });
});

/**
 * Mark messages as read
 */
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { id } = req.params;

  const conversation = await prisma.conversation.findUnique({
    where: { id },
    include: {
      participants: true,
    },
  });

  if (!conversation) {
    return res.status(404).json({
      success: false,
      message: 'Conversation not found',
    });
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === authReq.user!.id
  );

  if (!isParticipant) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized',
    });
  }

  await prisma.message.updateMany({
    where: {
      conversationId: id,
      senderId: { not: authReq.user!.id },
      read: false,
    },
    data: { read: true },
  });

  res.json({
    success: true,
    message: 'Messages marked as read',
  });
});

/**
 * Get unread message count
 */
export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;

  const count = await prisma.message.count({
    where: {
      conversation: {
        participants: {
          some: { userId: authReq.user!.id },
        },
      },
      senderId: { not: authReq.user!.id },
      read: false,
    },
  });

  res.json({
    success: true,
    data: { unreadCount: count },
  });
});