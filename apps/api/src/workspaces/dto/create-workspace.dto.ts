import { IsString, MinLength } from 'class-validator';

export class CreateWorkspaceDto {
  @IsString()
  @MinLength(1)
  nom!: string;
}
