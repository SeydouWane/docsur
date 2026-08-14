import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Autorise la route aux rôles listés. Sans ce décorateur, toute route
// protégée par JwtAuthGuard reste accessible à n'importe quel utilisateur
// authentifié — les restrictions par rôle sont opt-in et explicites.
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
