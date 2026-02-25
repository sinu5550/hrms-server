const prisma = require("../lib/prisma");

const getDesignations = async (req, res) => {
  try {
    const designations = await prisma.designation.findMany({
      include: {
        department: {
          select: { id: true, departmentCode: true, name: true },
        },
        _count: {
          select: { users: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    const formattedDesignations = designations.map((desig, index) => ({
      serialNo: index + 1,
      id: desig.id,
      designationCode: desig.designationCode,
      name: desig.name,
      departmentId: desig.departmentId || desig.department?.id,
      departmentCode: desig.department.departmentCode,
      departmentName: desig.department.name,
      employeeCount: desig._count.users,
      status: desig.status,
      createdAt: desig.createdAt,
    }));

    res.json(formattedDesignations);
  } catch (error) {
    console.error("Error fetching designations:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createDesignation = async (req, res) => {
  try {
    const { name, departmentId, status } = req.body;

    if (!name || !departmentId) {
      return res
        .status(400)
        .json({ error: "Name and department are required" });
    }

    // Auto-generate Designation Code
    const lastDesignation = await prisma.designation.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let newCode = "DES-001";
    if (lastDesignation && lastDesignation.designationCode) {
      const lastNumber = parseInt(
        lastDesignation.designationCode.replace("DES-", ""),
        10,
      );
      if (!isNaN(lastNumber)) {
        newCode = `DES-${String(lastNumber + 1).padStart(3, "0")}`;
      }
    }

    const newDesignation = await prisma.designation.create({
      data: {
        designationCode: newCode,
        name,
        departmentId,
        status: status || "Active",
      },
      include: {
        department: {
          select: { departmentCode: true, name: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    res.status(201).json({
      message: "Designation created successfully",
      designation: {
        id: newDesignation.id,
        departmentId: newDesignation.departmentId,
        designationCode: newDesignation.designationCode,
        name: newDesignation.name,
        departmentCode: newDesignation.department.departmentCode,
        employeeCount: newDesignation._count.users,
        status: newDesignation.status,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Designation with this name already exists" });
    }
    console.error("Error creating designation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateDesignation = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, departmentId, status } = req.body;

    const updatedDesignation = await prisma.designation.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(departmentId && { departmentId }),
        ...(status && { status }),
      },
      include: {
        department: {
          select: { departmentCode: true, name: true },
        },
        _count: {
          select: { users: true },
        },
      },
    });

    res.json({
      message: "Designation updated successfully",
      designation: {
        id: updatedDesignation.id,
        departmentId: updatedDesignation.departmentId,
        designationCode: updatedDesignation.designationCode,
        name: updatedDesignation.name,
        departmentCode: updatedDesignation.department.departmentCode,
        employeeCount: updatedDesignation._count.users,
        status: updatedDesignation.status,
      },
    });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Designation not found" });
    }
    console.error("Error updating designation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deleteDesignation = async (req, res) => {
  try {
    const { id } = req.params;

    const designation = await prisma.designation.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true },
        },
      },
    });

    if (!designation) {
      return res.status(404).json({ error: "Designation not found" });
    }

    if (designation._count.users > 0) {
      return res.status(400).json({
        error:
          "Cannot delete designation because employees are assigned to it.",
      });
    }

    await prisma.designation.delete({
      where: { id },
    });

    res.json({ message: "Designation deleted successfully" });
  } catch (error) {
    console.error("Error deleting designation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getDesignations,
  createDesignation,
  updateDesignation,
  deleteDesignation,
};
