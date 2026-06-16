import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || user.email !== 'azwarwaqar@gmail.com') {
      throw new ForbiddenException('Only azwarwaqar@gmail.com can access the admin panel');
    }

    return true;
  }
}
