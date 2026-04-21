import nodemailer from 'nodemailer';
import { config } from '../config';

/**
 * Creates a nodemailer transporter
 */
const transporter = nodemailer.createTransport({
  host: config.smtpHost,
  port: parseInt(config.smtpPort as string),
  secure: false,
  auth: {
    user: config.smtpUser,
    pass: config.smtpPass,
  },
});

/**
 * Email types
 */
export type EmailType = 
  | 'welcome'
  | 'forgotPassword'
  | 'resetPassword'
  | 'requestReceived'
  | 'requestAccepted'
  | 'requestRejected';

/**
 * Email data interface
 */
interface EmailData {
  to: string;
  subject: string;
  html: string;
}

/**
 * Sends an email
 * @param to - Recipient email
 * @param subject - Email subject
 * @param html - Email HTML content
 */
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: `"SkillSwap" <${config.smtpUser}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
}

/**
 * Generates email content based on type
 */
function getEmailContent(type: EmailType, data: Record<string, string>): { subject: string; html: string } {
  const templates: Record<EmailType, { subject: string; html: string }> = {
    welcome: {
      subject: 'Welcome to SkillSwap! 🎓',
      html: `
        <h1>Welcome to SkillSwap, ${data.name}!</h1>
        <p>We're excited to have you on board. Start sharing your skills and learning from others.</p>
        <p>Your journey to skill exchange begins now!</p>
        <a href="${data.link}" style="background: #3ecf8e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Get Started</a>
      `,
    },
    forgotPassword: {
      subject: 'Reset Your SkillSwap Password',
      html: `
        <h1>Reset Your Password</h1>
        <p>We received a request to reset your password. Click the button below to create a new password:</p>
        <a href="${data.link}" style="background: #3ecf8e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Reset Password</a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      `,
    },
    resetPassword: {
      subject: 'Your SkillSwap Password Has Been Changed',
      html: `
        <h1>Password Changed Successfully</h1>
        <p>Hi ${data.name},</p>
        <p>Your password has been successfully changed.</p>
        <p>If you didn't change your password, please contact us immediately.</p>
      `,
    },
    requestReceived: {
      subject: 'New Skill Request on SkillSwap',
      html: `
        <h1>New Skill Request</h1>
        <p>Hi ${data.name},</p>
        <p>You have received a new skill request from ${data.senderName}.</p>
        <p><strong>Offered Skill:</strong> ${data.offeredSkill}</p>
        <p><strong>Wanted Skill:</strong> ${data.wantedSkill}</p>
        <p><strong>Message:</strong> ${data.message || 'No message'}</p>
        <a href="${data.link}" style="background: #3ecf8e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Request</a>
      `,
    },
    requestAccepted: {
      subject: 'Your Skill Request Was Accepted! 🎉',
      html: `
        <h1>Request Accepted</h1>
        <p>Hi ${data.name},</p>
        <p>Great news! ${data.receiverName} has accepted your skill request.</p>
        <p>You can now start exchanging skills!</p>
        <a href="${data.link}" style="background: #3ecf8e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Conversation</a>
      `,
    },
    requestRejected: {
      subject: 'Your Skill Request Was Declined',
      html: `
        <h1>Request Declined</h1>
        <p>Hi ${data.name},</p>
        <p>Unfortunately, ${data.receiverName} has declined your skill request.</p>
        <p>Don't worry! There are plenty of other users who might be interested.</p>
        <a href="${data.link}" style="background: #3ecf8e; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Browse More Skills</a>
      `,
    },
  };

  return templates[type];
}

/**
 * Sends a typed email
 */
export async function sendTypedEmail(
  type: EmailType,
  to: string,
  data: Record<string, string>
): Promise<void> {
  const { subject, html } = getEmailContent(type, data);
  await sendEmail(to, subject, html);
}

/**
 * Sends a custom email
 */
export async function sendCustomEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  await sendEmail(to, subject, html);
}

export default {
  sendTypedEmail,
  sendCustomEmail,
};