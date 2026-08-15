import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

const PDF_OFFICE_URL = process.env.PDF_OFFICE_URL ?? 'http://localhost:3005';
const DELAI_MAX_MS = 120_000;

@Injectable()
export class PdfOfficeService {
  private readonly logger = new Logger(PdfOfficeService.name);

  async versWord(fichier: Express.Multer.File): Promise<Buffer> {
    return this.appeler('/vers-word', fichier);
  }

  async versPowerpoint(fichier: Express.Multer.File): Promise<Buffer> {
    return this.appeler('/vers-powerpoint', fichier);
  }

  private async appeler(chemin: string, fichier: Express.Multer.File): Promise<Buffer> {
    const formulaire = new FormData();
    formulaire.append('fichier', new Blob([new Uint8Array(fichier.buffer)]), fichier.originalname);

    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), DELAI_MAX_MS);

    try {
      const reponse = await fetch(`${PDF_OFFICE_URL}${chemin}`, {
        method: 'POST',
        body: formulaire,
        signal: controleur.signal,
      });

      if (!reponse.ok) {
        const corps = await reponse.json().catch(() => null);
        const message =
          (corps && typeof corps === 'object' && 'message' in corps && String(corps.message)) ||
          'La conversion a échoué';
        this.logger.warn(`pdf-office ${chemin} -> ${reponse.status}: ${message}`);
        throw new BadRequestException(message);
      }

      return Buffer.from(await reponse.arrayBuffer());
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`Appel pdf-office ${chemin} en échec`, err as Error);
      throw new InternalServerErrorException('Service de conversion Office indisponible');
    } finally {
      clearTimeout(minuteur);
    }
  }
}
