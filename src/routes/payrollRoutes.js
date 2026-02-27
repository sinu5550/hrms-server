const express = require("express");
const {
  createSalary,
  getSalaries,
  getSalaryById,
  createPayrollItem,
  getPayrollItems,
  updatePayrollItem,
  deletePayrollItem,
} = require("../controllers/payrollController");

const router = express.Router();

// Salaries
router.post("/salaries", createSalary);
router.get("/salaries", getSalaries);
router.get("/salaries/:id", getSalaryById);

// Payroll Items
router.post("/items", createPayrollItem);
router.get("/items", getPayrollItems);
router.put("/items/:id", updatePayrollItem);
router.delete("/items/:id", deletePayrollItem);

module.exports = router;
