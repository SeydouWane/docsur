import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { AuthenticatedRequest } from '../auth/authenticated-request';

// À combiner avec JwtAuthGuard (qui peuple request.user) : ce guard ne fait
// que vérifier le pouvoir plateforme, il n'authentifie rien lui-même.
@Injectable()
export class SuperAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user?.estSuperAdmin) {
      throw new ForbiddenException('Réservé aux super-administrateurs');
    }
    return true;
  }
}
