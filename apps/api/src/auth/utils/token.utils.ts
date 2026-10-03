import { JwtService } from '@nestjs/jwt';
import * as crypto from 'crypto';
import { JwtPayload } from '../strategies/jwt.strategy';

export const REFRESH_TOKEN_BYTES = 64;
export const DEFAULT_REFRESH_DAYS = 30;

export interface TokenBundle {
  accessToken: string;
  refreshToken: string;
  hashedRefreshToken: string;
  expiresAt: Date;
}

export interface UserTokenData {
  id: string;
  email: string;
  role: string;
  business?: { id: string } | null;
}

/** Cryptographically hash a token with SHA-256 before storing in database */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/** Generate a cryptographically secure random refresh token string */
export function generateRawRefreshToken(): string {
  return crypto.randomBytes(REFRESH_TOKEN_BYTES).toString('hex');
}

/** Calculate refresh token expiry date */
export function calculateRefreshTokenExpiry(days = DEFAULT_REFRESH_DAYS): Date {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + days);
  return expiry;
}

/**
 * Clean helper to generate an Access Token (JWT) and a high-entropy Refresh Token
 * (Mirrors Scath token utility pattern)
 */
export function generateAccessAndRefreshToken(
  jwtService: JwtService,
  user: UserTokenData,
  refreshDays?: number,
): TokenBundle {
  const payload: JwtPayload = {
    sub: user.id,
    email: user.email,
    businessId: user.business?.id ?? '',
    role: user.role,
  };

  const accessToken = jwtService.sign(payload);
  const rawRefreshToken = generateRawRefreshToken();
  const hashedRefreshToken = hashToken(rawRefreshToken);
  const expiresAt = calculateRefreshTokenExpiry(refreshDays);

  return {
    accessToken,
    refreshToken: rawRefreshToken,
    hashedRefreshToken,
    expiresAt,
  };
}
