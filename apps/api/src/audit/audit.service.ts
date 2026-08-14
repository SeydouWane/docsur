import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

type AuditEntry = {
  acteurId?: string;
  action: string;
  documentId?: string;
  adresseIp?: string;
  metadonnees?: Prisma.InputJsonObject;
};

// Écrit dans JournalAudit. Le service n'expose volontairement aucune méthode
// de suppression ou de mise à jour — le journal n'existe que pour être lu
// (voir §7 du dossier de spécifications : traçabilité immuable).
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async enregistrer(entry: AuditEntry): Promise<void> {
    await this.prisma.journalAudit.create({
      data: {
        acteurId: entry.acteurId,
        action: entry.action,
        documentId: entry.documentId,
        adresseIp: entry.adresseIp,
        metadonnees: entry.metadonnees,
      },
    });
  }
}
