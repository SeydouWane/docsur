import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(10, { message: 'Le mot de passe doit contenir au moins 10 caractères' })
  motDePasse!: string;

  @IsString()
  @MinLength(1)
  nom!: string;

  // Compte individuel (une seule personne) plutôt qu'entreprise : fonde
  // toujours sa propre organisation, jamais partagée avec d'autres comptes.
  // Forcé à true côté serveur pour les domaines email publics (§ auth.service).
  @IsOptional()
  @IsBoolean()
  individuel?: boolean;
}
