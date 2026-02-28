-- CreateTable Designation
CREATE TABLE "Designation" (
    "id" TEXT NOT NULL,
    "designationCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "status" "DepartmentStatus" NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for designationCode
CREATE UNIQUE INDEX "Designation_designationCode_key" ON "Designation"("designationCode");

-- CreateIndex for name
CREATE UNIQUE INDEX "Designation_name_key" ON "Designation"("name");

-- AddForeignKey
ALTER TABLE "Designation" ADD CONSTRAINT "Designation_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
