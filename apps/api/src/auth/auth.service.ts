import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import {
  EmailLoginDto,
  EmailSignupDto,
  RefreshTokenDto,
} from './dto/email-auth.dto';
import { GoogleAuthDto } from './dto/google-auth.dto';
import { GoogleAuthService } from './google-auth.service';
import { generateAccessAndRefreshToken, hashToken } from './utils/token.utils';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly googleAuthService: GoogleAuthService,
  ) {}

  /** Build full auth response */
  async buildAuthResponse(userId: string) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { business: true },
    });

    const tokens = generateAccessAndRefreshToken(this.jwtService, user);

    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    await this.prisma.refreshToken.create({
      data: {
        userId,
        token: tokens.hashedRefreshToken,
        expiresAt: tokens.expiresAt,
      },
    });

    return {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      needsBusinessSetup: !user.business,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        credit: user.credit,
        business: user.business,
      },
    };
  }

  // ─── Google OAuth (Scath Pattern — Zero Firebase Admin Required) ────────────

  async googleLogin(dto: GoogleAuthDto) {
    // 1. Verify Google ID token cryptographically using google-auth-library
    const googleUser = await this.googleAuthService.verifyIdToken(dto.idToken);

    // 2. Find or create user in PostgreSQL
    let user = await this.prisma.user.findUnique({
      where: { email: googleUser.email },
      include: { business: true },
    });

    if (!user) {
      // Create new user without business — user will be prompted to set up their store
      const fullName =
        `${googleUser.firstName} ${googleUser.lastName}`.trim() ||
        'Business Owner';
      user = await this.prisma.user.create({
        data: {
          email: googleUser.email,
          googleId: googleUser.googleId,
          fullName,
          avatarUrl: googleUser.avatarUrl,
        },
        include: { business: true },
      });

      this.logger.log(`New user registered via Google OAuth: ${user.email}`);
    } else if (!user.googleId) {
      // Link Google ID if user previously registered with email
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          googleId: googleUser.googleId,
          avatarUrl: user.avatarUrl || googleUser.avatarUrl,
        },
        include: { business: true },
      });
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled. Contact support.');
    }

    return this.buildAuthResponse(user.id);
  }

  // ─── Email Sign-Up (Bcrypt Hashed in DB) ────────────────────────────────────

  async emailSignup(dto: EmailSignupDto) {
    const email = dto.email.toLowerCase().trim();
    const phone = dto.phone?.trim() ? dto.phone.trim() : null;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing)
      throw new ConflictException('An account with this email already exists');

    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });
      if (existingPhone)
        throw new ConflictException(
          'An account with this phone number already exists',
        );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const result = await this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName: dto.fullName?.trim(),
          phone,
        },
      });

      let business: unknown = null;
      if (dto.businessName?.trim()) {
        business = await tx.business.create({
          data: {
            name: dto.businessName.trim(),
            type: dto.businessType?.trim() || null,
            phone,
            ownerId: user.id,
          },
        });
      }

      return { user, business };
    });

    this.logger.log(`New user registered via email: ${result.user.email}`);
    return this.buildAuthResponse(result.user.id);
  }

  // ─── Email Login (Direct Password Verification) ────────────────────────────

  async emailLogin(dto: EmailLoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase().trim() },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isMatch = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled. Contact support.');
    }

    return this.buildAuthResponse(user.id);
  }

  // ─── Refresh Token ──────────────────────────────────────────────────────────

  async refresh(dto: RefreshTokenDto) {
    const hashedIncoming = hashToken(dto.refreshToken);

    const stored = await this.prisma.refreshToken.findUnique({
      where: { token: hashedIncoming },
      include: { user: true },
    });

    if (!stored) throw new UnauthorizedException('Invalid refresh token');
    if (stored.expiresAt < new Date()) {
      await this.prisma.refreshToken.delete({ where: { id: stored.id } });
      throw new UnauthorizedException(
        'Refresh token expired. Please sign in again.',
      );
    }
    if (!stored.user?.isActive) {
      throw new UnauthorizedException('Account is disabled. Contact support.');
    }

    return this.buildAuthResponse(stored.userId);
  }

  // ─── Logout ─────────────────────────────────────────────────────────────────

  async logout(userId: string) {
    await this.prisma.refreshToken.deleteMany({ where: { userId } });
    return { message: 'Logged out successfully' };
  }

  // ─── Profile ────────────────────────────────────────────────────────────────

  async getMyProfile(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        googleId: true,
        firebaseUid: true,
        fullName: true,
        phone: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        credit: true,
        createdAt: true,
        updatedAt: true,
        business: true,
      },
    });
  }
}
