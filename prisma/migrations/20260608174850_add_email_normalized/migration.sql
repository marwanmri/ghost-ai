/*
  Warnings:

  - A unique constraint covering the columns `[projectId,emailNormalized]` on the table `ProjectCollaborator` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `emailNormalized` to the `ProjectCollaborator` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "ProjectCollaborator_email_idx";

-- DropIndex
DROP INDEX "ProjectCollaborator_projectId_email_key";

-- AlterTable
ALTER TABLE "ProjectCollaborator" ADD COLUMN     "emailNormalized" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ProjectCollaborator_emailNormalized_idx" ON "ProjectCollaborator"("emailNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "ProjectCollaborator_projectId_emailNormalized_key" ON "ProjectCollaborator"("projectId", "emailNormalized");
