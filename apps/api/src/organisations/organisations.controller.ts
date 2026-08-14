import { Body, Controller, Get, Param, Patch, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SuperAdminGuard } from '../rbac/super-admin.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-request';
import { UpdateStatutOrganisationDto } from './dto/update-statut-organisation.dto';

// Vue plateforme du superadmin (§ pouvoir plateforme) : toutes les
// organisations, tous secteurs confondus, avec le pouvoir de les
// activer/désactiver. Aucun de ces endpoints n'est accessible à un ADMIN
// d'organisation ordinaire.
@Controller('organisations')
@UseGuards(JwtAuthGuard, SuperAdminGuard)
export class OrganisationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Get()
  lister() {
    return this.prisma.organisation.findMany({
      select: {
        id: true,
        nom: true,
        domaineEmail: true,
        type: true,
        statut: true,
        region: true,
        planTarifaire: true,
        createdAt: true,
        _count: { select: { utilisateurs: true, workspaces: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Patch(':id/statut')
  async changerStatut(
    @Param('id') id: string,
    @Body() dto: UpdateStatutOrganisationDto,
    @CurrentUser() acteur: AuthenticatedUser,
  ) {
    const organisation = await this.prisma.organisation.update({
      where: { id },
      data: { statut: dto.statut },
    });

    await this.audit.enregistrer({
      acteurId: acteur.userId,
      action: dto.statut === 'DESACTIVEE' ? 'organisation.desactivation' : 'organisation.activation',
      metadonnees: { organisationId: id },
    });

    return organisation;
  }
}
