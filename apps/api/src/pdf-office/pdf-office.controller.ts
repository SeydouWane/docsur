import { BadRequestException, Controller, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { PdfOfficeService } from './pdf-office.service';
import { AuditService } from '../audit/audit.service';

const TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

// Pilier 3, catégorie "Convertir depuis PDF" (§4/§5) — traitement serveur
// éphémère via le microservice pdf-office (LibreOffice) : le fichier ne
// transite qu'en mémoire pour la durée de la requête.
@Controller('pdf-office')
export class PdfOfficeController {
  constructor(
    private readonly pdfOffice: PdfOfficeService,
    private readonly audit: AuditService,
  ) {}

  @Post('vers-word')
  @UseInterceptors(FileInterceptor('fichier', { limits: { fileSize: TAILLE_MAX_OCTETS } }))
  async versWord(
    @UploadedFile() fichier: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!fichier) throw new BadRequestException('Fichier manquant');

    const docx = await this.pdfOffice.versWord(fichier);

    await this.audit.enregistrer({
      action: 'pdf_office.vers_word',
      adresseIp: req.ip,
      metadonnees: { nomFichier: fichier.originalname },
    });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="aegis-num.docx"',
    });
    res.send(docx);
  }

  @Post('vers-powerpoint')
  @UseInterceptors(FileInterceptor('fichier', { limits: { fileSize: TAILLE_MAX_OCTETS } }))
  async versPowerpoint(
    @UploadedFile() fichier: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!fichier) throw new BadRequestException('Fichier manquant');

    const pptx = await this.pdfOffice.versPowerpoint(fichier);

    await this.audit.enregistrer({
      action: 'pdf_office.vers_powerpoint',
      adresseIp: req.ip,
      metadonnees: { nomFichier: fichier.originalname },
    });

    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'Content-Disposition': 'attachment; filename="aegis-num.pptx"',
    });
    res.send(pptx);
  }
}
