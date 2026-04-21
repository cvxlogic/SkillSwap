import bcrypt from 'bcryptjs';
import { config } from '../config';

const SALT_ROUNDS = 12;

/**
 * Hashes a password using bcrypt
 * @param password - Plain text password to hash
 * @returns Hashed password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compares a plain text password with a hashed password
 * @param password - Plain text password
 * @param hash - Hashed password to compare against
 * @returns Boolean indicating if passwords match
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generates a random numeric OTP
 * @param length - Length of OTP (default 6)
 * @returns Numeric OTP string
 */
export function generateOTP(length: number = 6): string {
  return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1)).toString();
}

/**
 * Generates a random string token
 * @param length - Length of token (default 32)
 * @returns Random string token
 */
export function generateToken(length: number = 32): string {
  return [...Array(length)].map(() => Math.random().toString(36).charAt(2)).join('');
}
