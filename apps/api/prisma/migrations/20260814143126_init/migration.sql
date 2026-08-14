-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MANAGER', 'COLLABORATEUR', 'INVITE_EXTERNE');

-- CreateEnum
CREATE TYPE "StatutUtilisateur" AS ENUM ('ACTIF', 'INVITE', 'SUSPENDU');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('SENEGAL_UEMOA', 'UNION_EUROPEENNE');

-- CreateEnum
CREATE TYPE "NiveauSignature" AS ENUM ('SIMPLE', 'AVANCEE');

-- CreateEnum
CREATE TYPE "StatutSignature" AS ENUM ('EN_ATTENTE', 'SIGNE', 'REFUSE', 'EXPIRE');

-- CreateTable
CREATE TABLE "Organisation" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "domaineEmail" TEXT NOT NULL,
    "region" "Region" NOT NULL DEFAULT 'SENEGAL_UEMOA',
    "mfaObligatoire" BOOLEAN NOT NULL DEFAULT true,
    "planTarifaire" TEXT NOT NULL DEFAULT 'starter',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organisation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "motDePasseHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'COLLABORATEUR',
    "statut" "StatutUtilisateur" NOT NULL DEFAULT 'ACTIF',
    "mfaActif" BOOLEAN NOT NULL DEFAULT false,
    "organisationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "retentionJours" INTEGER NOT NULL DEFAULT 365,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkspaceMembre" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "utilisateurId" TEXT NOT NULL,

    CONSTRAINT "WorkspaceMembre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "nom" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "proprietaireId" TEXT NOT NULL,
    "empreinteSha256" TEXT NOT NULL,
    "tailleOctets" INTEGER NOT NULL,
    "datePurgePrevue" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LienPartage" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "motDePasseHash" TEXT,
    "expireLe" TIMESTAMP(3) NOT NULL,
    "consultationsMax" INTEGER,
    "consultationsUtilisees" INTEGER NOT NULL DEFAULT 0,
    "revoque" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LienPartage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DemandeSignature" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "niveau" "NiveauSignature" NOT NULL DEFAULT 'SIMPLE',
    "statut" "StatutSignature" NOT NULL DEFAULT 'EN_ATTENTE',
    "certificatId" TEXT,
    "horodatageRfc3161" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DemandeSignature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Signataire" (
    "id" TEXT NOT NULL,
    "demandeSignatureId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "ordre" INTEGER NOT NULL,
    "statut" "StatutSignature" NOT NULL DEFAULT 'EN_ATTENTE',
    "signeLe" TIMESTAMP(3),

    CONSTRAINT "Signataire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalAudit" (
    "id" TEXT NOT NULL,
    "acteurId" TEXT,
    "action" TEXT NOT NULL,
    "documentId" TEXT,
    "adresseIp" TEXT,
    "horodatage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadonnees" JSONB,

    CONSTRAINT "JournalAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organisation_domaineEmail_key" ON "Organisation"("domaineEmail");

-- CreateIndex
CREATE UNIQUE INDEX "Utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE INDEX "Utilisateur_organisationId_idx" ON "Utilisateur"("organisationId");

-- CreateIndex
CREATE INDEX "Workspace_organisationId_idx" ON "Workspace"("organisationId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembre_workspaceId_utilisateurId_key" ON "WorkspaceMembre"("workspaceId", "utilisateurId");

-- CreateIndex
CREATE INDEX "Document_workspaceId_idx" ON "Document"("workspaceId");

-- CreateIndex
CREATE INDEX "LienPartage_documentId_idx" ON "LienPartage"("documentId");

-- CreateIndex
CREATE INDEX "DemandeSignature_documentId_idx" ON "DemandeSignature"("documentId");

-- CreateIndex
CREATE INDEX "Signataire_demandeSignatureId_idx" ON "Signataire"("demandeSignatureId");

-- CreateIndex
CREATE INDEX "JournalAudit_acteurId_idx" ON "JournalAudit"("acteurId");

-- CreateIndex
CREATE INDEX "JournalAudit_horodatage_idx" ON "JournalAudit"("horodatage");

-- AddForeignKey
ALTER TABLE "Utilisateur" ADD CONSTRAINT "Utilisateur_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Workspace" ADD CONSTRAINT "Workspace_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "Organisation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembre" ADD CONSTRAINT "WorkspaceMembre_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkspaceMembre" ADD CONSTRAINT "WorkspaceMembre_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_proprietaireId_fkey" FOREIGN KEY ("proprietaireId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LienPartage" ADD CONSTRAINT "LienPartage_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DemandeSignature" ADD CONSTRAINT "DemandeSignature_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Signataire" ADD CONSTRAINT "Signataire_demandeSignatureId_fkey" FOREIGN KEY ("demandeSignatureId") REFERENCES "DemandeSignature"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalAudit" ADD CONSTRAINT "JournalAudit_acteurId_fkey" FOREIGN KEY ("acteurId") REFERENCES "Utilisateur"("id") ON DELETE SET NULL ON UPDATE CASCADE;
