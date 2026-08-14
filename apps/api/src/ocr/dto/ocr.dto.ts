import { IsIn, IsOptional } from 'class-validator';

export class OcrDto {
  @IsOptional()
  @IsIn(['fra', 'eng', 'fra+eng'])
  langue?: 'fra' | 'eng' | 'fra+eng';
}
