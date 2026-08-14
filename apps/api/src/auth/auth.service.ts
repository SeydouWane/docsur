import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Role } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

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
  ) {}

  // Enrôlement par domaine (§4, pilier 1, MVP) : le premier compte créé sur
  // un domaine email fonde l'organisation et en devient administrateur ;
  // les suivants rejoignent l'organisation existante comme collaborateurs.
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

    let organisation = await this.prisma.organisation.findUnique({
      where: { domaineEmail: domaine },
    });
    const estNouvelleOrganisation = !organisation;
    if (!organisation) {
      organisation = await this.prisma.organisation.create({
        data: { nom: domaine, domaineEmail: domaine },
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
    });

    return this.emettreSession(utilisateur.id, utilisateur.organisationId, utilisateur.role);
  }

  async login(dto: LoginDto, adresseIp?: string) {
    const utilisateur = await this.prisma.utilisateur.findUnique({
      where: { email: dto.email },
    });
    if (!utilisateur) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    const motDePasseValide = await bcrypt.compare(dto.motDePasse, utilisateur.motDePasseHash);
    if (!motDePasseValide) {
      throw new UnauthorizedException('Identifiants invalides');
    }

    await this.audit.enregistrer({
      acteurId: utilisateur.id,
      action: 'utilisateur.connexion',
      adresseIp,
    });

    return this.emettreSession(utilisateur.id, utilisateur.organisationId, utilisateur.role);
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
        organisation: { select: { id: true, nom: true, region: true } },
      },
    });
    return utilisateur;
  }

  private emettreSession(userId: string, organisationId: string, role: Role) {
    const accessToken = this.jwt.sign({ sub: userId, organisationId, role });
    return { accessToken };
  }
}
