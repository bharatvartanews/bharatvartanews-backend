/*
  Warnings:

  - Changed the type of `type` on the `ArticleMedia` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterEnum
ALTER TYPE "MediaType" ADD VALUE 'AUDIO';

-- DropForeignKey
ALTER TABLE "ArticleMedia" DROP CONSTRAINT "ArticleMedia_articleId_fkey";

-- AlterTable
ALTER TABLE "Article" ADD COLUMN     "authorName" TEXT;

-- AlterTable
ALTER TABLE "ArticleMedia" DROP COLUMN "type",
ADD COLUMN     "type" "MediaType" NOT NULL;

-- AddForeignKey
ALTER TABLE "ArticleMedia" ADD CONSTRAINT "ArticleMedia_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
