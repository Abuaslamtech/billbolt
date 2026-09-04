import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const key = req.headers['x-api-key'];
    const expected = process.env.API_KEY;
    if (!expected) {
      // fail closed if the server forgot to set one, rather than being open
      throw new UnauthorizedException('Server is missing API_KEY configuration');
    }
    if (key !== expected) {
      throw new UnauthorizedException('Invalid or missing x-api-key header');
    }
    return true;
  }
}
