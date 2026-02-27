const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function test() {
  try {
    console.log("Testing user creation with relations...");
    const newUser = await prisma.user.create({
      data: {
        email: `test_${Date.now()}@example.com`,
        password: "password123",
        name: "Test User",
        firstName: "Test",
        lastName: "User",
        username: `testuser_${Date.now()}`,
        role: "EMPLOYEE",
        employeeId: `EMP-${Math.floor(Math.random() * 10000)}`,
      },
      include: {
        certificates: true,
        department: { select: { name: true, departmentCode: true } },
        designation: { select: { name: true, designationCode: true } },
      },
    });
    console.log("Success:", newUser);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

test();
