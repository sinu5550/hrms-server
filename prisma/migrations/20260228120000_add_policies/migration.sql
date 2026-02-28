-- AddColumn to Department
ALTER TABLE "Department" ADD COLUMN "departmentCode" TEXT;

-- AlterColumn managerId
ALTER TABLE "Department" ADD COLUMN "managerId" TEXT;

-- CreateIndex for departmentCode
CREATE UNIQUE INDEX "Department_departmentCode_key" ON "Department"("departmentCode");

-- AddForeignKey for managerId
ALTER TABLE "Department" ADD CONSTRAINT "Department_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable Policy
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "policyCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "departmentId" TEXT,
    "status" "DepartmentStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for policyCode
CREATE UNIQUE INDEX "Policy_policyCode_key" ON "Policy"("policyCode");

-- CreateIndex for name
CREATE UNIQUE INDEX "Policy_name_key" ON "Policy"("name");

-- AddForeignKey for departmentId
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE SET NULL ON UPDATE CASCADE;
