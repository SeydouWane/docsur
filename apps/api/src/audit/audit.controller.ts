import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-request';
import { ListerAuditDto } from './dto/lister-audit.dto';

// Lecture du journal — la portée dépend de qui regarde, jamais d'un
// paramètre côté client : un superadmin voit tout, un ADMIN voit son
// organisation, un collaborateur ne voit que ses propres actions. Le
// journal est immuable (voir AuditService) : ce contrôleur n'expose que
// des lectures.
@Controller('audit')
@UseGuards(JwtAuthGuard)
export class AuditController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  lister(@CurrentUser() acteur: AuthenticatedUser, @Query() query: ListerAuditDto) {
    const limite = query.limite ?? 50;

    const where: Prisma.JournalAuditWhereInput = acteur.estSuperAdmin
      ? {}
      : acteur.role === Role.ADMIN
        ? { acteur: { organisationId: acteur.organisationId } }
        : { acteurId: acteur.userId };

    if (query.action) {
      where.action = { contains: query.action };
    }

    return this.prisma.journalAudit.findMany({
      where,
      orderBy: { horodatage: 'desc' },
      take: limite,
      select: {
        id: true,
        action: true,
        horodatage: true,
        metadonnees: true,
        acteur: { select: { nom: true, email: true } },
      },
    });
  }
}
