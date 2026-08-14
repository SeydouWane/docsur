import { BadRequestException, Body, Controller, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';
import { OcrService } from './ocr.service';
import { AuditService } from '../audit/audit.service';
import { OcrDto } from './dto/ocr.dto';

const TAILLE_MAX_OCTETS = 50 * 1024 * 1024;

// Pilier 3, catégorie "Optimiser" (§4/§5) — traitement serveur éphémère via
// le microservice pdf-ocr (ocrmypdf + Tesseract) : le fichier ne transite
// qu'en mémoire pour la durée de la requête, rien n'est écrit côté API.
@Controller('ocr')
export class OcrController {
  constructor(
    private readonly ocr: OcrService,
    private readonly audit: AuditService,
  ) {}

  @Post()
  @UseInterceptors(FileInterceptor('fichier', { limits: { fileSize: TAILLE_MAX_OCTETS } }))
  async reconnaitreTexte(
    @UploadedFile() fichier: Express.Multer.File | undefined,
    @Body() dto: OcrDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!fichier) throw new BadRequestException('Fichier manquant');

    const pdf = await this.ocr.reconnaitreTexte(fichier, dto.langue ?? 'fra+eng');

    await this.audit.enregistrer({
      action: 'ocr.reconnaitre',
      adresseIp: req.ip,
      metadonnees: { nomFichier: fichier.originalname, langue: dto.langue ?? 'fra+eng' },
    });

    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="ocr.pdf"' });
    res.send(pdf);
  }
}
