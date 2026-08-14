import { ConflictException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role, StatutOrganisation, StatutUtilisateur, TypeOrganisation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { MailService } from '../mail/mail.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { estDomainePublic } from './domaines-publics';

const BCRYPT_ROUNDS = 12;

function domaineDe(email: string): string {
  return email.split('@')[1]?.toLowerCase() ?? '';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly audit: AuditService,
    private readonly mail: MailService,
  ) {}

  // Enrôlement par domaine (§4, pilier 1, MVP) : le premier compte créé sur
  // un domaine email fonde l'organisation et en devient administrateur ;
  // les suivants rejoignent l'organisation existante comme collaborateurs.
  //
  // Un compte individuel (dto.individuel, ou domaine email public comme
  // gmail.com) fonde systématiquement sa propre organisation, jamais
  // partagée : un domaine public ne peut pas servir d'identifiant commun à
  // des inconnus.
  async register(dto: RegisterDto, adresseIp?: string) {
    const domaine = domaineDe(dto.email);
    if (!domaine) {
      throw new ConflictException('Adresse email invalide');
    }

    const dejaExistant = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    });
    if (dejaExistant) {
      throw new ConflictException('Un compte existe déjà pour cet email');
    }

    const individuel = Boolean(dto.individuel) || estDomainePublic(domaine);

    let organisation = individuel
      ? null
      : await this.prisma.organisation.findUnique({ where: { domaineEmail: domaine } });
    const estNouvelleOrganisation = !organisation;

    if (!organisation) {
      organisation = await this.prisma.organisation.create({
        data: individuel
          ? {
              // Le domaine public seul ne peut pas être la clé d'unicité : deux
              // particuliers chez le même fournisseur d'email doivent avoir des
              // organisations distinctes. On y met l'email complet, unique par
              // construction.
              nom: dto.nom,
              domaineEmail: dto.email.toLowerCase(),
              type: TypeOrganisation.INDIVIDUEL,
            }
          : { nom: domaine, domaineEmail: domaine, type: TypeOrganisation.ENTREPRISE },
      });
    }

    const motDePasseHash = await bcrypt.hash(dto.motDePasse, BCRYPT_ROUNDS);
    const utilisateur = await this.prisma.utilisateur.create({
      data: {
        email: dto.email,
        nom: dto.nom,
        motDePasseHash,
        role: estNouvelleOrganisation ? Role.ADMIN : Role.COLLABORATEUR,
        organisationId: organisation.id,
      },
    });

    await this.audit.enregistrer({
      acteurId: utilisateur.id,
      action: estNouvelleOrganisation ? 'organisation.creation' : 'utilisateur.inscription',
      adresseIp,
      metadonnees: { individuel },
    });

    await this.mail.envoyerBienvenue(utilisateur.email, utilisateur.nom);

    return this.emettreSession(utilisateur);
  }

  async login(dto: LoginDto, adresseIp?: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
      include: { organisation: true },
    });
    if (!utilisateur) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, utilisateur.motDePasseHash);
    if (!motDePasseValide) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    if (utilisateur.statut === StatutUtilisateur.SUSPENDU) {
      throw new ForbiddenException('Ce compte a été désactivé par un administrateur');
    }
    if (utilisateur.organisation.statut === StatutOrganisation.DESACTIVEE) {
      throw new ForbiddenException('Cette organisation a été désactivée');
    }

    await this.audit.enregistrer({
      acteurId: utilisateur.id,
      action: 'utilisateur.connexion',
      adresseIp,
    });

    return this.emettreSession(utilisateur);
  }

  async profil(userId: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nom: true,
        role: true,
        statut: true,
        mfaActif: true,
        estSuperAdmin: true,
        organisation: { select: { id: true, nom: true, region: true, type: true, statut: true } },
      },
    });
    return utilisateur;
  }

  private emettreSession(utilisateur: {
    id: string;
    organisationId: string;
    role: Role;
    estSuperAdmin: boolean;
  }) {
    const accessToken = this.jwt.sign({
      sub: utilisateur.id,
      organisationId: utilisateur.organisationId,
      role: utilisateur.role,
      estSuperAdmin: utilisateur.estSuperAdmin,
    });
    return { accessToken };
  }
}
