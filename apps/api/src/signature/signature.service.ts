import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

const PDF_SIGNATURE_URL = process.env.PDF_SIGNATURE_URL ?? 'http://localhost:3006';
const DELAI_MAX_MS = 60_000;

export type ZoneSignature = {
  page: number;
  x: number;
  y: number;
  largeur: number;
  hauteur: number;
};

@Injectable()
export class SignatureService {
  private readonly logger = new Logger(SignatureService.name);

  async signer(
    fichier: Express.Multer.File,
    image: Express.Multer.File,
    zone: ZoneSignature,
    nomSignataire: string,
  ): Promise<Buffer> {
    const formulaire = new FormData();
    formulaire.append('fichier', new Blob([new Uint8Array(fichier.buffer)]), fichier.originalname);
    formulaire.append('image', new Blob([new Uint8Array(image.buffer)]), image.originalname);
    formulaire.append('page', String(zone.page));
    formulaire.append('x', String(zone.x));
    formulaire.append('y', String(zone.y));
    formulaire.append('largeur', String(zone.largeur));
    formulaire.append('hauteur', String(zone.hauteur));
    formulaire.append('nomSignataire', nomSignataire);

    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), DELAI_MAX_MS);

    try {
      const reponse = await fetch(`${PDF_SIGNATURE_URL}/signer`, {
        method: 'POST',
        body: formulaire,
        signal: controleur.signal,
      });

      if (!reponse.ok) {
        const corps = await reponse.json().catch(() => null);
        const message =
          (corps && typeof corps === 'object' && 'message' in corps && String(corps.message)) ||
          'La signature a échoué';
        this.logger.warn(`pdf-signature /signer -> ${reponse.status}: ${message}`);
        throw new BadRequestException(message);
      }

      return Buffer.from(await reponse.arrayBuffer());
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error('Appel pdf-signature en échec', err as Error);
      throw new InternalServerErrorException('Service de signature indisponible');
    } finally {
      clearTimeout(minuteur);
    }
  }
}
