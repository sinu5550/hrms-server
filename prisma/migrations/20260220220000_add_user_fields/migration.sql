-- AlterTable User - Add all profile fields
ALTER TABLE "User" ADD COLUMN "firstName" TEXT,
ADD COLUMN "lastName" TEXT,
ADD COLUMN "username" TEXT,
ADD COLUMN "employeeId" TEXT,
ADD COLUMN "joiningDate" TIMESTAMP(3),
ADD COLUMN "phone" TEXT,
ADD COLUMN "company" TEXT,
ADD COLUMN "about" TEXT,
ADD COLUMN "designationId" TEXT,
ADD COLUMN "profilePhotoUrl" TEXT,
ADD COLUMN "dateOfBirth" TIMESTAMP(3),
ADD COLUMN "gender" TEXT,
ADD COLUMN "maritalStatus" TEXT,
ADD COLUMN "nationality" TEXT,
ADD COLUMN "identificationNo" TEXT,
ADD COLUMN "ssnNo" TEXT,
ADD COLUMN "passportNo" TEXT,
ADD COLUMN "emergencyContactName" TEXT,
ADD COLUMN "emergencyContactPhone" TEXT,
ADD COLUMN "privateAddress" TEXT,
ADD COLUMN "dependentChildren" INTEGER DEFAULT 0,
ADD COLUMN "placeOfBirth" TEXT,
ADD COLUMN "visaNo" TEXT,
ADD COLUMN "workPermitNo" TEXT,
ADD COLUMN "privateEmail" TEXT,
ADD COLUMN "privatePhone" TEXT,
ADD COLUMN "bankAccounts" TEXT,
ADD COLUMN "certificateLevel" TEXT,
ADD COLUMN "fieldOfStudy" TEXT,
ADD COLUMN "resumeUrl" TEXT;

-- CreateIndex for username
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex for employeeId
CREATE UNIQUE INDEX "User_employeeId_key" ON "User"("employeeId");

-- AddForeignKey for designationId
ALTER TABLE "User" ADD CONSTRAINT "User_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
