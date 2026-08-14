import { IsString, MinLength } from 'class-validator';

export class HtmlVersPdfDto {
  @IsString()
  @MinLength(1)
  url!: string;
}
