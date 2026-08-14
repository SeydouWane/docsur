import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
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
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { AddMembreDto } from './dto/add-membre.dto';

// Démembrements d'une organisation (EQUIPE FINANCE, EQUIPE RH...) — §4,
// pilier 1. La création est réservée à l'ADMIN de l'organisation ; la
// lecture est ouverte à tout membre authentifié de la même organisation.
@Controller('workspaces')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkspacesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  lister(@CurrentUser() acteur: AuthenticatedUser) {
    return this.prisma.workspace.findMany({
      where: { organisationId: acteur.organisationId },
      select: {
        id: true,
        nom: true,
        retentionJours: true,
        createdAt: true,
        _count: { select: { membres: true, documents: true } },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  @Roles(Role.ADMIN)
  @Post()
  async creer(@Body() dto: CreateWorkspaceDto, @CurrentUser() acteur: AuthenticatedUser) {
    const workspace = await this.prisma.workspace.create({
      data: { nom: dto.nom, organisationId: acteur.organisationId },
    });

    await this.audit.enregistrer({
      acteurId: acteur.userId,
      action: 'workspace.creation',
      metadonnees: { workspaceId: workspace.id, nom: dto.nom },
    });

    return workspace;
  }

  @Roles(Role.ADMIN)
  @Post(':id/membres')
  async ajouterMembre(
    @Param('id') id: string,
    @Body() dto: AddMembreDto,
    @CurrentUser() acteur: AuthenticatedUser,
  ) {
    const workspace = await this.prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new NotFoundException('Espace de travail introuvable');
    if (workspace.organisationId !== acteur.organisationId) {
      throw new ForbiddenException('Hors de votre organisation');
    }

    const membre = await this.prisma.utilisateur.findUnique({ where: { id: dto.utilisateurId } });
    if (!membre || membre.organisationId !== acteur.organisationId) {
      throw new ForbiddenException("Cet utilisateur n'appartient pas à votre organisation");
    }

    const lien = await this.prisma.workspaceMembre.upsert({
      where: { workspaceId_utilisateurId: { workspaceId: id, utilisateurId: dto.utilisateurId } },
      update: {},
      create: { workspaceId: id, utilisateurId: dto.utilisateurId },
    });

    await this.audit.enregistrer({
      acteurId: acteur.userId,
      action: 'workspace.ajout_membre',
      metadonnees: { workspaceId: id, membreId: dto.utilisateurId },
    });

    return lien;
  }
}
