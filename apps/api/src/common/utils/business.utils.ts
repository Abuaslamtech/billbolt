import { BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { JwtPayload } from 'src/auth/strategies/jwt.strategy';

/**
 * Resolves the active business ID for the authenticated user.
 * Throws BadRequestException('Store setup required') if the user has no configured business.
 */
export async function resolveBusinessId(
  prisma: PrismaService,
  user: JwtPayload,
): Promise<string> {
  if (user.businessId) return user.businessId;

  const business = await prisma.business.findUnique({
    where: { ownerId: user.sub },
    select: { id: true },
  });

  if (!business?.id) {
    throw new BadRequestException('Store setup required');
  }

  return business.id;
}
