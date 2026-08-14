import type { Request } from 'express';
import type { Role } from '@prisma/client';

export type AuthenticatedUser = {
  userId: string;
  organisationId: string;
  role: Role;
};

export type AuthenticatedRequest = Request & { user: AuthenticatedUser };
