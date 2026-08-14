import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Role, StatutOrganisation, StatutUtilisateur } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthenticatedUser } from './authenticated-request';

type JwtPayload = {
  sub: string;
  organisationId: string;
  role: Role;
  estSuperAdmin: boolean;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET ?? 'change-me-in-production',
    });
  }

  // Un JWT valide ne suffit pas : un compte suspendu ou une organisation
  // désactivée après l'émission du token doivent perdre l'accès immédiatement,
  // pas seulement à l'expiration (jusqu'à 8h). D'où la vérification en base
  // à chaque requête plutôt qu'une simple confiance dans le payload signé.
  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: payload.sub },
      select: { statut: true, organisation: { select: { statut: true } } },
    });

    if (!utilisateur || utilisateur.statut === StatutUtilisateur.SUSPENDU) {
      throw new UnauthorizedException('Compte désactivé');
    }
    if (utilisateur.organisation.statut === StatutOrganisation.DESACTIVEE) {
      throw new UnauthorizedException('Organisation désactivée');
    }

    return {
      userId: payload.sub,
      organisationId: payload.organisationId,
      role: payload.role,
      estSuperAdmin: payload.estSuperAdmin,
    };
  }
}
