const express = require("express");
const {
  createUser,
  getUsers,
  login,
} = require("../controllers/userController");

const router = express.Router();

router.post("/", createUser);
router.get("/", getUsers);
router.post("/login", login);

module.exports = router;
