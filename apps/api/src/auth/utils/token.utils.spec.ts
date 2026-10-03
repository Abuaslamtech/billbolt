import { JwtService } from '@nestjs/jwt';
import {
  hashToken,
  generateRawRefreshToken,
  calculateRefreshTokenExpiry,
  generateAccessAndRefreshToken,
  REFRESH_TOKEN_BYTES,
  DEFAULT_REFRESH_DAYS,
} from './token.utils';

describe('token.utils', () => {
  describe('hashToken', () => {
    it('should deterministically produce a SHA-256 hex digest', () => {
      const token = 'test-token-123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);

      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
      expect(hash1).toMatch(/^[0-9a-f]{64}$/);
    });
  });

  describe('generateRawRefreshToken', () => {
    it('should generate a high-entropy hex string of expected length', () => {
      const token = generateRawRefreshToken();
      expect(token).toHaveLength(REFRESH_TOKEN_BYTES * 2); // 64 bytes = 128 hex chars
    });
  });

  describe('calculateRefreshTokenExpiry', () => {
    it('should calculate expiry Date based on default days', () => {
      const before = Date.now();
      const expiry = calculateRefreshTokenExpiry();
      const diffDays = Math.round(
        (expiry.getTime() - before) / (1000 * 60 * 60 * 24),
      );
      expect(diffDays).toBe(DEFAULT_REFRESH_DAYS);
    });
  });

  describe('generateAccessAndRefreshToken', () => {
    it('should return a complete TokenBundle with signed access token and hashed refresh token', () => {
      const signSpy = jest.fn().mockReturnValue('mock_jwt_access_token');
      const mockJwtService = {
        sign: signSpy,
      } as unknown as JwtService;

      const user = {
        id: 'user-1',
        email: 'user@example.com',
        role: 'OWNER',
        business: { id: 'biz-1' },
      };

      const result = generateAccessAndRefreshToken(mockJwtService, user);

      expect(result.accessToken).toBe('mock_jwt_access_token');
      expect(result.refreshToken).toBeDefined();
      expect(result.hashedRefreshToken).toBe(hashToken(result.refreshToken));
      expect(result.expiresAt).toBeInstanceOf(Date);

      expect(signSpy).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        businessId: 'biz-1',
        role: user.role,
      });
    });
  });
});
