const prisma = require("../lib/prisma");

const getDepartments = async (req, res) => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { users: true },
        },
        manager: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Restructure to easily access employee count and manager details
    const formattedDepartments = departments.map((dept, index) => ({
      serialNo: index + 1,
      id: dept.id,
      departmentCode: dept.departmentCode,
      name: dept.name,
      status: dept.status,
      manager: dept.manager,
      employeeCount: dept._count.users,
      createdAt: dept.createdAt,
    }));

    res.json(formattedDepartments);
  } catch (error) {
    console.error("Error fetching departments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createDepartment = async (req, res) => {
  try {
    const { name, status, managerId } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Department name is required" });
    }

    // Auto-generate Department Code
    const lastDepartment = await prisma.department.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let newCode = "D-001";
    if (lastDepartment && lastDepartment.departmentCode) {
      const lastNumber = parseInt(
        lastDepartment.departmentCode.replace("D-", ""),
        10,
      );
      if (!isNaN(lastNumber)) {
        newCode = `D-${String(lastNumber + 1).padStart(3, "0")}`;
      }
    }

    const newDepartment = await prisma.department.create({
      data: {
        departmentCode: newCode,
        name,
        status: status || "Active",
        ...(managerId && { managerId }),
      },
      include: {
        _count: {
          select: { users: true },
        },
        manager: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      message: "Department created successfully",
      department: {
        id: newDepartment.id,
        departmentCode: newDepartment.departmentCode,
        name: newDepartment.name,
        status: newDepartment.status,
        manager: newDepartment.manager,
        employeeCount: newDepartment._count.users,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Department with this name already exists" });
    }
    console.error("Error creating department:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, managerId } = req.body;

    const updatedDepartment = await prisma.department.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(status && { status }),
        ...(managerId !== undefined && { managerId: managerId || null }),
      },
      include: {
        _count: { select: { users: true } },
        manager: { select: { id: true, name: true } },
      },
    });

    res.json({
      message: "Department updated successfully",
      department: {
        id: updatedDepartment.id,
        departmentCode: updatedDepartment.departmentCode,
        name: updatedDepartment.name,
        status: updatedDepartment.status,
        manager: updatedDepartment.manager,
        employeeCount: updatedDepartment._count.users,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Department not found" });
    }
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Another department with this name already exists" });
    }
    console.error("Error updating department:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Check if department has users before deleting
    const department = await prisma.department.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!department) {
      return res.status(404).json({ error: "Department not found" });
    }

    if (department._count.users > 0) {
      return res.status(400).json({
        error:
          "Cannot delete department because it still has employees assigned to it.",
      });
    }

    await prisma.department.delete({
      where: { id },
    });

    res.json({ message: "Department deleted successfully" });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
