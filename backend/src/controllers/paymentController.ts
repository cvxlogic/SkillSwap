import { Request, Response } from 'express';
import CryptoJS from 'crypto-js';
import prisma from '../utils/prisma';
import { asyncHandler, AppError } from '../services/errorService';
import { AuthRequest } from '../middleware/auth';
import { createNotification } from '../services/notificationService';

/**
 * Create Razorpay order
 */
export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { requestId } = req.body;

  const request = await prisma.skillRequest.findUnique({
    where: { id: requestId },
    include: {
      receiver: { select: { id: true, name: true } },
    },
  });

  if (!request) {
    throw new AppError('Request not found', 404);
  }

  if (request.type !== 'PAID') {
    throw new AppError('This is not a paid request', 400);
  }

  // Get the skill to determine price
  const skill = await prisma.skill.findFirst({
    where: {
      id: request.offeredSkill,
    },
  });

  const userSkill = await prisma.userSkill.findFirst({
    where: {
      userId: request.receiverId,
      skillId: request.offeredSkill,
    },
  });

  if (!userSkill || !userSkill.isPaid || !userSkill.price) {
    throw new AppError('Skill is not available for paid classes', 400);
  }

  const amount = userSkill.price * 100; // Razorpay expects paise

  // In production, use actual Razorpay SDK
  // const razorpay = new Razorpay({
  //   key_id: config.razorpayKeyId,
  //   key_secret: config.razorpayKeySecret,
  // });
  // const order = await razorpay.orders.create({ amount, currency: 'INR' });

  // Mock order for development
  const order = {
    id: `order_${Date.now()}`,
    amount,
    currency: 'INR',
    status: 'created',
  };

  // Create pending payment
  const payment = await prisma.payment.create({
    data: {
      payerId: authReq.user!.id,
      payeeId: request.receiverId,
      requestId,
      amount: userSkill.price,
      razorpayId: order.id,
      status: 'PENDING',
    },
  });

  res.status(201).json({
    success: true,
    data: {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment.id,
    },
  });
});

/**
 * Verify payment
 */
export const verifyPayment = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

  // In production, verify with Razorpay
  // const generated_signature = hmac_sha256(razorpayOrderId + "|" + razorpayPaymentId, config.razorpayKeySecret);
  // if (generated_signature !== razorpaySignature) {
  //   throw new AppError('Payment verification failed', 400);
  // }

  const payment = await prisma.payment.findFirst({
    where: { razorpayId: razorpayOrderId },
    include: {
      request: {
        include: {
          receiver: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  // Update payment status
  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: { status: 'COMPLETED', razorpayId: razorpayPaymentId },
  });

  // Update request status
  const updatedRequest = await prisma.skillRequest.update({
    where: { id: payment.requestId },
    data: { status: 'ACCEPTED' },
  });

  // Create conversation
  const conversation = await prisma.conversation.create({
    data: { requestId: payment.requestId },
  });

  await prisma.conversationParticipant.createMany({
    data: [
      { conversationId: conversation.id, userId: payment.payerId },
      { conversationId: conversation.id, userId: payment.payeeId },
    ],
  });

  // Send notification to teacher
  await createNotification(
    payment.payeeId,
    'PAYMENT',
    'Payment Received',
    `You received a payment of ₹${payment.amount}`,
    `/payments`
  );

  res.json({
    success: true,
    data: {
      payment: updatedPayment,
      request: updatedRequest,
      conversation,
    },
  });
});

/**
 * Get my payments
 */
export const getMyPayments = asyncHandler(async (req: Request, res: Response) => {
  const authReq = req as AuthRequest;
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: {
        OR: [{ payerId: authReq.user!.id }, { payeeId: authReq.user!.id }],
      },
      skip,
      take: limit,
      include: {
        payer: { select: { id: true, name: true, profilePic: true } },
        payee: { select: { id: true, name: true, profilePic: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.payment.count({
      where: {
        OR: [{ payerId: authReq.user!.id }, { payeeId: authReq.user!.id }],
      },
    }),
  ]);

  res.json({
    success: true,
    data: {
      payments,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    },
  });
});

/**
 * Request refund
 */
export const requestRefund = asyncHandler(async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });

  if (!payment) {
    throw new AppError('Payment not found', 404);
  }

  if (payment.status !== 'COMPLETED') {
    throw new AppError('Payment cannot be refunded', 400);
  }

  await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'REFUNDED' },
  });

  res.json({
    success: true,
    message: 'Refund requested',
  });
});