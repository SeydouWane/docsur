import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

const OCR_URL = process.env.OCR_URL ?? 'http://localhost:3004';
const DELAI_MAX_MS = 180_000;

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  async reconnaitreTexte(fichier: Express.Multer.File, langue: string): Promise<Buffer> {
    const formulaire = new FormData();
    formulaire.append('fichier', new Blob([new Uint8Array(fichier.buffer)]), fichier.originalname);
    formulaire.append('langue', langue);

    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), DELAI_MAX_MS);

    try {
      const reponse = await fetch(`${OCR_URL}/ocr`, {
        method: 'POST',
        body: formulaire,
        signal: controleur.signal,
      });

      if (!reponse.ok) {
        const corps = await reponse.json().catch(() => null);
        const message =
          (corps && typeof corps === 'object' && 'message' in corps && String(corps.message)) ||
          'La reconnaissance de texte a échoué';
        this.logger.warn(`pdf-ocr /ocr -> ${reponse.status}: ${message}`);
        throw new BadRequestException(message);
      }

      return Buffer.from(await reponse.arrayBuffer());
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error('Appel pdf-ocr en échec', err as Error);
      throw new InternalServerErrorException('Service OCR indisponible');
    } finally {
      clearTimeout(minuteur);
    }
  }
}
