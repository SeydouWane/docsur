import { IsEnum } from 'class-validator';
import { StatutOrganisation } from '@prisma/client';

export class UpdateStatutOrganisationDto {
  @IsEnum(StatutOrganisation)
  statut!: StatutOrganisation;
}
