const prisma = require("../lib/prisma");

// Salaries
const createSalary = async (req, res) => {
  try {
    const data = req.body;

    // Check if salary already exists for this user, month, and year
    const existingSalary = await prisma.salary.findFirst({
      where: {
        userId: data.userId,
        month: data.month,
        year: data.year,
      },
    });

    let salary;
    if (existingSalary) {
      // Update existing
      salary = await prisma.salary.update({
        where: { id: existingSalary.id },
        data: {
          amount: parseFloat(data.amount),
          earnings: data.earnings || {},
          deductions: data.deductions || {},
          netSalary: parseFloat(data.netSalary),
        },
        include: { user: true },
      });
    } else {
      // Create new
      salary = await prisma.salary.create({
        data: {
          userId: data.userId,
          amount: parseFloat(data.amount),
          month: data.month,
          year: data.year,
          earnings: data.earnings || {},
          deductions: data.deductions || {},
          netSalary: parseFloat(data.netSalary),
          payslipNo: `PS-${Date.now()}`,
        },
        include: { user: true },
      });
    }

    res.status(existingSalary ? 200 : 201).json(salary);

    // Emit socket event
    if (req.io) {
      req.io.emit(existingSalary ? "salaryUpdated" : "salaryCreated", salary);
    }
  } catch (error) {
    console.error("Error saving salary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSalaries = async (req, res) => {
  try {
    const salaries = await prisma.salary.findMany({
      include: {
        user: {
          include: {
            designation: true,
            department: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(salaries);
  } catch (error) {
    console.error("Error fetching salaries:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getSalaryById = async (req, res) => {
  try {
    const { id } = req.params;
    const salary = await prisma.salary.findUnique({
      where: { id },
      include: {
        user: {
          include: {
            designation: true,
            department: true,
          },
        },
      },
    });
    if (!salary)
      return res.status(404).json({ error: "Salary record not found" });
    res.json(salary);
  } catch (error) {
    console.error("Error fetching salary:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Payroll Items
const createPayrollItem = async (req, res) => {
  try {
    const data = req.body;
    const item = await prisma.payrollItem.create({
      data: {
        name: data.name,
        category: data.category,
        amountType: data.amountType,
        defaultValue: parseFloat(data.defaultValue || 0),
      },
    });
    res.status(201).json(item);

    // Emit socket event
    if (req.io) {
      req.io.emit("payrollItemCreated", item);
    }
  } catch (error) {
    console.error("Error creating payroll item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getPayrollItems = async (req, res) => {
  try {
    const items = await prisma.payrollItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(items);
  } catch (error) {
    console.error("Error fetching payroll items:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updatePayrollItem = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;
    const item = await prisma.payrollItem.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        amountType: data.amountType,
        defaultValue: parseFloat(data.defaultValue || 0),
      },
    });
    res.json(item);

    // Emit socket event
    if (req.io) {
      req.io.emit("payrollItemUpdated", item);
    }
  } catch (error) {
    console.error("Error updating payroll item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const deletePayrollItem = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.payrollItem.delete({ where: { id } });
    res.json({ message: "Payroll item deleted successfully" });

    // Emit socket event
    if (req.io) {
      req.io.emit("payrollItemDeleted", id);
    }
  } catch (error) {
    console.error("Error deleting payroll item:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createSalary,
  getSalaries,
  getSalaryById,
  createPayrollItem,
  getPayrollItems,
  updatePayrollItem,
  deletePayrollItem,
};
