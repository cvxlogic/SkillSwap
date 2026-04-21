import jwt from 'jsonwebtoken';
import { config } from '../config';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
  isAdmin: boolean;
}

export interface RefreshTokenPayload {
  userId: string;
  token: string;
}

/**
 * Generates a JWT access token
 * @param payload - User data to encode in the token
 * @returns Signed JWT token
 */
export function generateAccessToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: '15m',
  });
}

/**
 * Generates a JWT refresh token
 * @param payload - User data to encode in the token
 * @returns Signed JWT refresh token
 */
export function generateRefreshToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwtRefreshSecret, {
    expiresIn: '7d',
  });
}

/**
 * Verifies an access token
 * @param token - JWT token to verify
 * @returns Decoded payload or throws error
 */
export function verifyAccessToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}

/**
 * Verifies a refresh token
 * @param token - JWT refresh token to verify
 * @returns Decoded payload or throws error
 */
export function verifyRefreshToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtRefreshSecret) as JwtPayload;
}
