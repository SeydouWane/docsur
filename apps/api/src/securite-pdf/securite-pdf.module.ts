import { Module } from '@nestjs/common';
import { SecuritePdfController } from './securite-pdf.controller';
import { SecuritePdfService } from './securite-pdf.service';

@Module({
  controllers: [SecuritePdfController],
  providers: [SecuritePdfService],
})
export class SecuritePdfModule {}
