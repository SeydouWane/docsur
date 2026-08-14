import { IsString } from 'class-validator';

export class AddMembreDto {
  @IsString()
  utilisateurId!: string;
}
