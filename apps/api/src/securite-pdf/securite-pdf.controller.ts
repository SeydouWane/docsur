import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { SecuritePdfService } from './securite-pdf.service';
import { AuditService } from '../audit/audit.service';
import { MotDePasseDto } from './dto/mot-de-passe.dto';

const TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

// Pilier 3, catégorie "Sécurité" (§4/§5) — traitement serveur éphémère via
// le microservice pdf-securite (qpdf) : rien n'est écrit sur disque côté
// API, le fichier ne transite qu'en mémoire pour la durée de la requête.
@Controller('securite-pdf')
export class SecuritePdfController {
  constructor(
    private readonly securite: SecuritePdfService,
    private readonly audit: AuditService,
  ) {}

  @Post('proteger')
  @UseInterceptors(FileInterceptor('fichier', { limits: { fileSize: TAILLE_MAX_OCTETS } }))
  async proteger(
    @UploadedFile() fichier: Express.Multer.File | undefined,
    @Body() dto: MotDePasseDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!fichier) throw new BadRequestException('Fichier manquant');

    const pdf = await this.securite.proteger(fichier, dto.motDePasse);

    await this.audit.enregistrer({
      action: 'securite_pdf.proteger',
      adresseIp: req.ip,
      metadonnees: { nomFichier: fichier.originalname },
    });

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="protege.pdf"' });
    res.send(pdf);
  }

  @Post('deverrouiller')
  @UseInterceptors(FileInterceptor('fichier', { limits: { fileSize: TAILLE_MAX_OCTETS } }))
  async deverrouiller(
    @UploadedFile() fichier: Express.Multer.File | undefined,
    @Body() dto: MotDePasseDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!fichier) throw new BadRequestException('Fichier manquant');

    const pdf = await this.securite.deverrouiller(fichier, dto.motDePasse);

    await this.audit.enregistrer({
      action: 'securite_pdf.deverrouiller',
      adresseIp: req.ip,
      metadonnees: { nomFichier: fichier.originalname },
    });

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="deverrouille.pdf"' });
    res.send(pdf);
  }

  @Post('reparer')
  @UseInterceptors(FileInterceptor('fichier', { limits: { fileSize: TAILLE_MAX_OCTETS } }))
  async reparer(
    @UploadedFile() fichier: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!fichier) throw new BadRequestException('Fichier manquant');

    const pdf = await this.securite.reparer(fichier);

    await this.audit.enregistrer({
      action: 'securite_pdf.reparer',
      adresseIp: req.ip,
      metadonnees: { nomFichier: fichier.originalname },
    });

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="repare.pdf"' });
    res.send(pdf);
  }

  @Post('compresser')
  @UseInterceptors(FileInterceptor('fichier', { limits: { fileSize: TAILLE_MAX_OCTETS } }))
  async compresser(
    @UploadedFile() fichier: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!fichier) throw new BadRequestException('Fichier manquant');

    const pdf = await this.securite.compresser(fichier);

    await this.audit.enregistrer({
      action: 'securite_pdf.compresser',
      adresseIp: req.ip,
      metadonnees: { nomFichier: fichier.originalname, octetsAvant: fichier.size, octetsApres: pdf.byteLength },
    });

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="compresse.pdf"' });
    res.send(pdf);
  }
}
