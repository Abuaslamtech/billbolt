import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { JwtPayload } from '../strategies/jwt.strategy';

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

/** Extracts the JWT payload from the request, injected by JwtStrategy */
export const GetUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtPayload => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user as JwtPayload;
  },
);
