import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { validerUrlPublique } from './url-publique';

const GOTENBERG_URL = process.env.GOTENBERG_URL ?? 'http://localhost:3002';
const DELAI_MAX_MS = 60_000;

// Formats que LibreOffice sait ouvrir de façon fiable — volontairement une
// liste blanche plutôt qu'un refus par extension interdite.
const MIMETYPES_OFFICE = new Set([
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.text',
  'application/vnd.oasis.opendocument.spreadsheet',
  'application/vnd.oasis.opendocument.presentation',
  'application/rtf',
  'text/rtf',
]);

@Injectable()
export class ConversionsService {
  private readonly logger = new Logger(ConversionsService.name);

  async officeVersPdf(fichier: Express.Multer.File): Promise<Buffer> {
    if (!MIMETYPES_OFFICE.has(fichier.mimetype)) {
      throw new BadRequestException('Format de fichier non pris en charge');
    }

    const formulaire = new FormData();
    formulaire.append('files', new Blob([new Uint8Array(fichier.buffer)]), fichier.originalname);

    return this.appelerGotenberg('/forms/libreoffice/convert', formulaire);
  }

  async htmlVersPdf(urlBrute: string): Promise<Buffer> {
    const validation = validerUrlPublique(urlBrute);
    if (!validation.ok) {
      throw new BadRequestException(validation.raison);
    }

    const formulaire = new FormData();
    formulaire.append('url', validation.url.toString());

    return this.appelerGotenberg('/forms/chromium/convert/url', formulaire);
  }

  private async appelerGotenberg(chemin: string, formulaire: FormData): Promise<Buffer> {
    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), DELAI_MAX_MS);

    try {
      const reponse = await fetch(`${GOTENBERG_URL}${chemin}`, {
        method: 'POST',
        body: formulaire,
        signal: controleur.signal,
      });

      if (!reponse.ok) {
        const detail = await reponse.text().catch(() => '');
        this.logger.warn(`Gotenberg ${chemin} -> ${reponse.status}: ${detail.slice(0, 300)}`);
        throw new BadRequestException("La conversion a échoué — vérifiez le fichier ou l'adresse");
      }

      return Buffer.from(await reponse.arrayBuffer());
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`Appel Gotenberg ${chemin} en échec`, err as Error);
      throw new InternalServerErrorException('Service de conversion indisponible');
    } finally {
      clearTimeout(minuteur);
    }
  }
}
