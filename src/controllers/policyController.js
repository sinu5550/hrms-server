const prisma = require("../lib/prisma");

const getPolicies = async (req, res) => {
  try {
    const policies = await prisma.policy.findMany({
      include: {
        department: {
          select: { id: true, name: true },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    // Restructure to easily access policy details
    const formattedPolicies = policies.map((policy, index) => ({
      serialNo: index + 1,
      id: policy.id,
      policyCode: policy.policyCode,
      name: policy.name,
      description: policy.description,
      department: policy.department,
      status: policy.status,
      createdAt: policy.createdAt,
    }));

    res.json(formattedPolicies);
  } catch (error) {
    console.error("Error fetching policies:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const createPolicy = async (req, res) => {
  try {
    const { name, description, departmentId, status } = req.body;

    if (!name || !description) {
      return res
        .status(400)
        .json({ error: "Policy name and description are required" });
    }

    // Auto-generate Policy Code
    const lastPolicy = await prisma.policy.findFirst({
      orderBy: { createdAt: "desc" },
    });

    let newCode = "P-001";
    if (lastPolicy && lastPolicy.policyCode) {
      const lastNumber = parseInt(lastPolicy.policyCode.replace("P-", ""), 10);
      if (!isNaN(lastNumber)) {
        newCode = `P-${String(lastNumber + 1).padStart(3, "0")}`;
      }
    }

    const newPolicy = await prisma.policy.create({
      data: {
        policyCode: newCode,
        name,
        description,
        status: status || "Active",
        ...(departmentId && { departmentId }),
      },
      include: {
        department: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(201).json({
      message: "Policy created successfully",
      policy: {
        id: newPolicy.id,
        policyCode: newPolicy.policyCode,
        name: newPolicy.name,
        description: newPolicy.description,
        department: newPolicy.department,
        status: newPolicy.status,
      },
    });

    // Emit socket event
    if (req.io) {
      req.io.emit("policyCreated", newPolicy);
    }
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Policy with this name already exists" });
    }
    console.error("Error creating policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePolicy = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, departmentId, status } = req.body;

    const updatedPolicy = await prisma.policy.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(status && { status }),
        ...(departmentId !== undefined && {
          departmentId: departmentId || null,
        }),
      },
      include: {
        department: { select: { id: true, name: true } },
      },
    });

    res.json({
      message: "Policy updated successfully",
      policy: {
        id: updatedPolicy.id,
        policyCode: updatedPolicy.policyCode,
        name: updatedPolicy.name,
        description: updatedPolicy.description,
        department: updatedPolicy.department,
        status: updatedPolicy.status,
      },
    });

    // Emit socket event
    if (req.io) {
      req.io.emit("policyUpdated", updatedPolicy);
    }
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Policy not found" });
    }
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "Another policy with this name already exists" });
    }
    console.error("Error updating policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePolicy = async (req, res) => {
  try {
    const { id } = req.params;

    const policy = await prisma.policy.findUnique({
      where: { id },
    });

    if (!policy) {
      return res.status(404).json({ error: "Policy not found" });
    }

    await prisma.policy.delete({
      where: { id },
    });

    res.json({ message: "Policy deleted successfully" });

    // Emit socket event
    if (req.io) {
      req.io.emit("policyDeleted", id);
    }
  } catch (error) {
    console.error("Error deleting policy:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
};
