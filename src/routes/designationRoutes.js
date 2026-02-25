const express = require("express");
const router = express.Router();
const designationController = require("../controllers/designationController");

router.get("/", designationController.getDesignations);
router.post("/", designationController.createDesignation);
router.put("/:id", designationController.updateDesignation);
router.delete("/:id", designationController.deleteDesignation);

module.exports = router;
