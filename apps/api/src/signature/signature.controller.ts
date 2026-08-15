import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { AuthenticatedRequest } from '../auth/authenticated-request';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { SignatureService } from './signature.service';
import { SignerDto } from './dto/signer.dto';

const TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

// Pilier 3, catégorie "Sécurité" — signature électronique PAdES (chaîne DSS +
// step-ca + horodatage RFC 3161, cf. §7 des spécifications). Le nom du
// signataire n'est jamais pris tel quel côté client : il est lu sur le
// compte authentifié, puisqu'il est gravé dans un certificat cryptographique
// réel — accepter une valeur arbitraire permettrait à quiconque de se faire
// émettre un certificat au nom de la personne de son choix.
@Controller('signature')
@UseGuards(JwtAuthGuard)
export class SignatureController {
  constructor(
    private readonly signature: SignatureService,
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Post('signer')
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'fichier', maxCount: 1 },
        { name: 'image', maxCount: 1 },
      ],
      { limits: { fileSize: TAILLE_MAX_OCTETS } },
    ),
  )
  async signer(
    @UploadedFiles() fichiers: { fichier?: Express.Multer.File[]; image?: Express.Multer.File[] },
    @Body() dto: SignerDto,
    @Req() req: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    const fichier = fichiers.fichier?.[0];
    const image = fichiers.image?.[0];
    if (!fichier) throw new BadRequestException('Fichier PDF manquant');
    if (!image) throw new BadRequestException('Image de signature manquante');

    const utilisateur = await this.prisma.utilisateur.findUniqueOrThrow({
      where: { id: req.user.userId },
      select: { nom: true },
    });

    const pdf = await this.signature.signer(
      fichier,
      image,
      { page: dto.page, x: dto.x, y: dto.y, largeur: dto.largeur, hauteur: dto.hauteur },
      utilisateur.nom,
    );

    await this.audit.enregistrer({
      acteurId: req.user.userId,
      action: 'signature.signer',
      adresseIp: req.ip,
      metadonnees: { nomFichier: fichier.originalname, page: dto.page },
    });

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="signe.pdf"' });
    res.send(pdf);
  }
}
