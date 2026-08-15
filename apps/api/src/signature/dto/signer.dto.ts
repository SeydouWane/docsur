import { Type } from 'class-transformer';
import { IsInt, IsNumber, Min } from 'class-validator';

export class SignerDto {
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page!: number;

  @Type(() => Number)
  @IsNumber()
  x!: number;

  @Type(() => Number)
  @IsNumber()
  y!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  largeur!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  hauteur!: number;
}
