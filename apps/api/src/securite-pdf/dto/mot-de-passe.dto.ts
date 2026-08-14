import { IsString, MinLength } from 'class-validator';

export class MotDePasseDto {
  @IsString()
  @MinLength(1)
  motDePasse!: string;
}
