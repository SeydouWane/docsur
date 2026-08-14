import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import type { AuthenticatedUser } from '../auth/authenticated-request';

// Endpoint de démonstration : liste les métadonnées des documents des
// espaces de travail de l'organisation de l'appelant. Ne renvoie jamais le
// contenu d'un fichier — seulement ce que §6 du dossier de spécifications
// autorise à stocker en base (métadonnées, jamais le document lui-même).
@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  async lister(@CurrentUser() user: AuthenticatedUser) {
    return this.prisma.document.findMany({
      where: { workspace: { organisationId: user.organisationId } },
      select: {
        id: true,
        nom: true,
        tailleOctets: true,
        createdAt: true,
        datePurgePrevue: true,
        workspace: { select: { id: true, nom: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
