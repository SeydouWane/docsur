import { Injectable, Logger } from '@nestjs/common';
import { createTransport, Transporter } from 'nodemailer';

type EnvoiEmail = { to: string; subject: string; html: string; text: string };

function echapperHtml(valeur: string): string {
  return valeur
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Un email est un canal best-effort : son échec ne doit jamais faire échouer
// l'action métier qui l'a déclenché (inscription, partage...). Sans
// EMAIL_HOST configuré, le service journalise au lieu d'envoyer, pour que
// l'environnement de développement fonctionne sans SMTP.
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;

  constructor() {
    this.from = process.env.DEFAULT_FROM_EMAIL ?? 'DocSur <no-reply@docsur.local>';

    const host = process.env.EMAIL_HOST;
    if (!host) {
      this.logger.warn('EMAIL_HOST absent — les emails seront journalisés, pas envoyés');
      this.transporter = null;
      return;
    }

    const port = Number(process.env.EMAIL_PORT ?? 587);
    this.transporter = createTransport({
      host,
      port,
      secure: port === 465,
      requireTLS: port !== 465 && process.env.EMAIL_USE_TLS !== 'False',
      auth: process.env.EMAIL_HOST_USER
        ? { user: process.env.EMAIL_HOST_USER, pass: process.env.EMAIL_HOST_PASSWORD }
        : undefined,
    });
  }

  async envoyer(email: EnvoiEmail): Promise<void> {
    if (!this.transporter) {
      this.logger.debug(`[email non envoyé] à ${email.to} — ${email.subject}`);
      return;
    }
    try {
      const info = await this.transporter.sendMail({ from: this.from, ...email });
      this.logger.debug(`Email envoyé à ${email.to} (${info.messageId})`);
    } catch (err) {
      this.logger.error(`Échec d'envoi d'email à ${email.to} : ${(err as Error).message}`);
    }
  }

  async envoyerBienvenue(destinataire: string, nom: string): Promise<void> {
    const nomAffiche = echapperHtml(nom);
    await this.envoyer({
      to: destinataire,
      subject: 'Bienvenue sur DocSur',
      text: `Bonjour ${nom},\n\nVotre compte DocSur a été créé avec succès.\n\nL'équipe DocSur`,
      html: `<p>Bonjour ${nomAffiche},</p><p>Votre compte DocSur a été créé avec succès.</p><p>L'équipe DocSur</p>`,
    });
  }
}
