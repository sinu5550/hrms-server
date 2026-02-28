-- AlterTable - Make password nullable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;
