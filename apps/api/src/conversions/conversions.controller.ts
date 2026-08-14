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
import { ConversionsService } from './conversions.service';
import { AuditService } from '../audit/audit.service';
import { HtmlVersPdfDto } from './dto/html-vers-pdf.dto';

const TAILLE_MAX_OCTETS = 25 * 1024 * 1024;

// Pilier 3, catégorie "Convertir en PDF" (§4/§5) — traitement serveur,
// éphémère : le fichier ne transite qu'en mémoire pour la durée de la
// requête, jamais écrit sur disque ni conservé après la réponse.
@Controller('conversions')
export class ConversionsController {
  constructor(
    private readonly conversions: ConversionsService,
    private readonly audit: AuditService,
  ) {}

  @Post('vers-pdf')
  @UseInterceptors(FileInterceptor('fichier', { limits: { fileSize: TAILLE_MAX_OCTETS } }))
  async versPdf(
    @UploadedFile() fichier: Express.Multer.File | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!fichier) throw new BadRequestException('Fichier manquant');

    const pdf = await this.conversions.officeVersPdf(fichier);

    await this.audit.enregistrer({
      action: 'conversion.office_vers_pdf',
      adresseIp: req.ip,
      metadonnees: { nomFichier: fichier.originalname, octets: fichier.size },
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="converti.pdf"',
    });
    res.send(pdf);
  }

  @Post('html-vers-pdf')
  async htmlVersPdf(@Body() dto: HtmlVersPdfDto, @Req() req: Request, @Res() res: Response) {
    const pdf = await this.conversions.htmlVersPdf(dto.url);

    await this.audit.enregistrer({
      action: 'conversion.html_vers_pdf',
      adresseIp: req.ip,
      metadonnees: { url: dto.url },
    });

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="page.pdf"',
    });
    res.send(pdf);
  }
}
