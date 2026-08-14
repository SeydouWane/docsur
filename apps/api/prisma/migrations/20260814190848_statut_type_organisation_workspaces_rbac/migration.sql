-- CreateEnum
CREATE TYPE "StatutOrganisation" AS ENUM ('ACTIVE', 'DESACTIVEE');

-- CreateEnum
CREATE TYPE "TypeOrganisation" AS ENUM ('ENTREPRISE', 'INDIVIDUEL');

-- AlterTable
ALTER TABLE "Organisation" ADD COLUMN     "statut" "StatutOrganisation" NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN     "type" "TypeOrganisation" NOT NULL DEFAULT 'ENTREPRISE';
