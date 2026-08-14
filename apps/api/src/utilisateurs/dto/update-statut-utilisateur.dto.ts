import { IsIn } from 'class-validator';

// Volontairement restreint à ACTIF/SUSPENDU : INVITE relève du cycle de vie
// de l'enrôlement, pas d'une bascule manuelle par un admin.
export class UpdateStatutUtilisateurDto {
  @IsIn(['ACTIF', 'SUSPENDU'])
  statut!: 'ACTIF' | 'SUSPENDU';
}
