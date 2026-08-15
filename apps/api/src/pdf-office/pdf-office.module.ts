import { Module } from '@nestjs/common';
import { PdfOfficeController } from './pdf-office.controller';
import { PdfOfficeService } from './pdf-office.service';

@Module({
  controllers: [PdfOfficeController],
  providers: [PdfOfficeService],
})
export class PdfOfficeModule {}
