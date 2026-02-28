const express = require("express");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserRole,
  login,
} = require("../controllers/userController");
const { upload } = require("../lib/cloudinaryConfig");

const router = express.Router();

router.post(
  "/",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
  ]),
  createUser,
);
router.get("/", getUsers);
router.get("/:id", getUserById);
router.post("/login", login);
router.put("/:id/role", updateUserRole);
router.put(
  "/:id",
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "resume", maxCount: 1 },
    { name: "certificates", maxCount: 10 },
  ]),
  updateUser,
);

module.exports = router;
