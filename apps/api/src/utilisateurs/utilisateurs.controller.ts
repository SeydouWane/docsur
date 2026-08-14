import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../rbac/roles.guard';
import { Roles } from '../rbac/roles.decorator';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-request';
import { UpdateStatutUtilisateurDto } from './dto/update-statut-utilisateur.dto';

// Gestion des collaborateurs par l'ADMIN de leur propre organisation
// (§4, pilier 1) — jamais inter-organisations : chaque vérification recroise
// organisationId de la cible avec celle de l'acteur.
@Controller('utilisateurs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UtilisateursController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Roles(Role.ADMIN, Role.MANAGER)
  @Get()
  lister(@CurrentUser() acteur: AuthenticatedUser) {
    return this.prisma.utilisateur.findMany({
      where: { organisationId: acteur.organisationId },
      select: { id: true, email: true, nom: true, role: true, statut: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Roles(Role.ADMIN)
  @Patch(':id/statut')
  async changerStatut(
    @Param('id') id: string,
    @Body() dto: UpdateStatutUtilisateurDto,
    @CurrentUser() acteur: AuthenticatedUser,
  ) {
    const cible = await this.prisma.utilisateur.findUnique({ where: { id } });
    if (!cible) throw new NotFoundException('Utilisateur introuvable');
    if (cible.organisationId !== acteur.organisationId) {
      throw new ForbiddenException("Hors de votre organisation");
    }
    if (cible.id === acteur.userId) {
      throw new ForbiddenException('Impossible de modifier votre propre statut');
    }

    const utilisateur = await this.prisma.utilisateur.update({
      where: { id },
      data: { statut: dto.statut },
      select: { id: true, email: true, nom: true, role: true, statut: true },
    });

    await this.audit.enregistrer({
      acteurId: acteur.userId,
      action: dto.statut === 'SUSPENDU' ? 'utilisateur.desactivation' : 'utilisateur.reactivation',
      metadonnees: { cibleId: id },
    });

    return utilisateur;
  }
}
