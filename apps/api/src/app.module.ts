import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuditModule } from './audit/audit.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { DocumentsModule } from './documents/documents.module';
import { OrganisationsModule } from './organisations/organisations.module';
import { UtilisateursModule } from './utilisateurs/utilisateurs.module';
import { WorkspacesModule } from './workspaces/workspaces.module';
import { ConversionsModule } from './conversions/conversions.module';
import { SecuritePdfModule } from './securite-pdf/securite-pdf.module';
import { OcrModule } from './ocr/ocr.module';
import { PdfOfficeModule } from './pdf-office/pdf-office.module';

@Module({
  imports: [
    PrismaModule,
    AuditModule,
    MailModule,
    AuthModule,
    DocumentsModule,
    OrganisationsModule,
    UtilisateursModule,
    WorkspacesModule,
    ConversionsModule,
    SecuritePdfModule,
    OcrModule,
    PdfOfficeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
