import { z } from 'zod';

/**
 * Email validation regex
 */
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Phone validation regex (Indian mobile numbers)
 */
const phoneRegex = /^[6-9]\d{9}$/;

/**
 * Password strength validation (min 8 chars, 1 uppercase, 1 lowercase, 1 number)
 */
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

/**
 * Zod schema for user registration
 */
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Invalid email format').refine((val) => emailRegex.test(val), 'Invalid email format'),
    password: z.string().min(8, 'Password must be at least 8 characters').refine(
      (val) => passwordRegex.test(val),
      'Password must contain uppercase, lowercase, and number'
    ),
    role: z.enum(['STUDENT', 'TEACHER', 'EXCHANGER', 'OTHER']).optional(),
  }),
});

/**
 * Zod schema for user login
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

/**
 * Zod schema for Google OAuth
 */
export const googleAuthSchema = z.object({
  body: z.object({
    googleToken: z.string().min(1, 'Google token is required'),
  }),
});

/**
 * Zod schema for refresh token
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

/**
 * Zod schema for forgot password
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

/**
 * Zod schema for reset password
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').refine(
      (val) => passwordRegex.test(val),
      'Password must contain uppercase, lowercase, and number'
    ),
  }),
});

/**
 * Zod schema for sending OTP
 */
export const sendOTPSchema = z.object({
  body: z.object({
    phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number'),
  }),
});

/**
 * Zod schema for verifying OTP
 */
export const verifyOTPSchema = z.object({
  body: z.object({
    phone: z.string().regex(phoneRegex, 'Invalid Indian mobile number'),
    otp: z.string().length(6, 'OTP must be 6 digits'),
  }),
});

/**
 * Zod schema for updating user profile
 */
export const updateProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    bio: z.string().max(500).optional(),
    role: z.enum(['STUDENT', 'TEACHER', 'EXCHANGER', 'OTHER']).optional(),
  }),
});

/**
 * Zod schema for skill creation
 */
export const skillSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Skill name must be at least 2 characters').max(100, 'Skill name must be less than 100 characters'),
    category: z.string().min(2, 'Category is required').max(50),
  }),
});

/**
 * Zod schema for adding a skill to user profile
 */
export const userSkillSchema = z.object({
  body: z.object({
    skillId: z.string().uuid('Invalid skill ID'),
    type: z.enum(['HAVE', 'WANT']),
    isPaid: z.boolean().optional(),
    price: z.number().positive().optional(),
  }),
});

/**
 * Zod schema for updating user skill
 */
export const updateUserSkillSchema = z.object({
  body: z.object({
    isPaid: z.boolean().optional(),
    price: z.number().positive().optional(),
  }),
});

/**
 * Zod schema for skill request
 */
export const requestSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid('Invalid receiver ID'),
    offeredSkill: z.string().uuid('Invalid offered skill ID'),
    wantedSkill: z.string().uuid('Invalid wanted skill ID'),
    type: z.enum(['EXCHANGE', 'LEARN', 'PAID']),
    message: z.string().max(500).optional(),
  }),
});

/**
 * Zod schema for sending a message
 */
export const messageSchema = z.object({
  body: z.object({
    content: z.string().min(1, 'Message content is required').max(2000, 'Message must be less than 2000 characters'),
    type: z.enum(['TEXT', 'IMAGE', 'FILE']).optional(),
  }),
});

/**
 * Zod schema for creating a rating
 */
export const ratingSchema = z.object({
  body: z.object({
    ratedId: z.string().uuid('Invalid user ID'),
    requestId: z.string().uuid('Invalid request ID'),
    stars: z.number().min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
    review: z.string().max(500).optional(),
  }),
});

/**
 * Zod schema for payment creation
 */
export const paymentSchema = z.object({
  body: z.object({
    requestId: z.string().uuid('Invalid request ID'),
  }),
});

/**
 * Zod schema for payment verification
 */
export const paymentVerifySchema = z.object({
  body: z.object({
    razorpayPaymentId: z.string().min(1, 'Payment ID is required'),
    razorpayOrderId: z.string().min(1, 'Order ID is required'),
    razorpaySignature: z.string().min(1, 'Signature is required'),
  }),
});

/**
 * Zod schema for creating a report
 */
export const reportSchema = z.object({
  body: z.object({
    reportedId: z.string().uuid('Invalid user ID'),
    reason: z.enum(['SPAM', 'ABUSE', 'BAD_TEACHING', 'INAPPROPRIATE', 'OTHER']),
    description: z.string().min(10, 'Description must be at least 10 characters').max(1000),
  }),
});

/**
 * Zod schema for user search
 */
export const userSearchSchema = z.object({
  query: z.object({
    q: z.string().optional(),
    skill: z.string().optional(),
    role: z.enum(['STUDENT', 'TEACHER', 'EXCHANGER', 'OTHER']).optional(),
    type: z.enum(['HAVE', 'WANT']).optional(),
    rating: z.coerce.number().min(0).max(5).optional(),
  }),
});

/**
 * Type exports for validated data
 */
export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
export type SendOTPInput = z.infer<typeof sendOTPSchema>['body'];
export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>['body'];
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>['body'];
export type SkillInput = z.infer<typeof skillSchema>['body'];
export type UserSkillInput = z.infer<typeof userSkillSchema>['body'];
export type UpdateUserSkillInput = z.infer<typeof updateUserSkillSchema>['body'];
export type RequestInput = z.infer<typeof requestSchema>['body'];
export type MessageInput = z.infer<typeof messageSchema>['body'];
export type RatingInput = z.infer<typeof ratingSchema>['body'];
export type PaymentInput = z.infer<typeof paymentSchema>['body'];
export type PaymentVerifyInput = z.infer<typeof paymentVerifySchema>['body'];
export type ReportInput = z.infer<typeof reportSchema>['body'];
export type UserSearchInput = z.infer<typeof userSearchSchema>['query'];