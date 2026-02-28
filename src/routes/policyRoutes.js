const express = require("express");
const router = express.Router();
const {
  getPolicies,
  createPolicy,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policyController");

router.get("/", getPolicies);
router.post("/", createPolicy);
router.put("/:id", updatePolicy);
router.delete("/:id", deletePolicy);

module.exports = router;
