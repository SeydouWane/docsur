import { BadRequestException, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';

const PDF_SECURITE_URL = process.env.PDF_SECURITE_URL ?? 'http://localhost:3003';
const DELAI_MAX_MS = 45_000;

@Injectable()
export class SecuritePdfService {
  private readonly logger = new Logger(SecuritePdfService.name);

  async proteger(fichier: Express.Multer.File, motDePasse: string): Promise<Buffer> {
    return this.appeler('/proteger', fichier, { motDePasse });
  }

  async deverrouiller(fichier: Express.Multer.File, motDePasse: string): Promise<Buffer> {
    return this.appeler('/deverrouiller', fichier, { motDePasse });
  }

  async reparer(fichier: Express.Multer.File): Promise<Buffer> {
    return this.appeler('/reparer', fichier, {});
  }

  private async appeler(
    chemin: string,
    fichier: Express.Multer.File,
    champs: Record<string, string>,
  ): Promise<Buffer> {
    const formulaire = new FormData();
    formulaire.append('fichier', new Blob([new Uint8Array(fichier.buffer)]), fichier.originalname);
    for (const [cle, valeur] of Object.entries(champs)) {
      formulaire.append(cle, valeur);
    }

    const controleur = new AbortController();
    const minuteur = setTimeout(() => controleur.abort(), DELAI_MAX_MS);

    try {
      const reponse = await fetch(`${PDF_SECURITE_URL}${chemin}`, {
        method: 'POST',
        body: formulaire,
        signal: controleur.signal,
      });

      if (!reponse.ok) {
        const corps = await reponse.json().catch(() => null);
        const message =
          (corps && typeof corps === 'object' && 'message' in corps && String(corps.message)) ||
          'La demande a échoué';
        this.logger.warn(`pdf-securite ${chemin} -> ${reponse.status}: ${message}`);
        throw new BadRequestException(message);
      }

      return Buffer.from(await reponse.arrayBuffer());
    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error(`Appel pdf-securite ${chemin} en échec`, err as Error);
      throw new InternalServerErrorException('Service de sécurité PDF indisponible');
    } finally {
      clearTimeout(minuteur);
    }
  }
}
