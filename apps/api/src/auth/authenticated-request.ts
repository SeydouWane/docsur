import type { Request } from 'express';
import type { Role } from '@prisma/client';

export type AuthenticatedUser = {
  userId: string;
  organisationId: string;
  role: Role;
  estSuperAdmin: boolean;
};

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
