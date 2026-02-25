const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const createUser = async (req, res) => {
  try {
    const {
      email,
      password,
      role,
      firstName,
      lastName,
      username,
      phone,
      company,
      about,
      departmentId,
      designationId,
      joiningDate,
    } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Auto-generate Employee ID
    const lastUser = await prisma.user.findFirst({
      where: { employeeId: { startsWith: "EMP-" } },
      orderBy: { createdAt: "desc" },
    });

    let newEmpId = "EMP-0001";
    if (lastUser && lastUser.employeeId) {
      const lastNumber = parseInt(lastUser.employeeId.replace("EMP-", ""), 10);
      if (!isNaN(lastNumber)) {
        newEmpId = `EMP-${String(lastNumber + 1).padStart(4, "0")}`;
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        username,
        role: role || "EMPLOYEE",
        employeeId: newEmpId,
        phone,
        company,
        about,
        departmentId,
        designationId,
        joiningDate: joiningDate ? new Date(joiningDate) : null,
      },
    });

    // Generate token
    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(201).json({
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: { select: { name: true, departmentCode: true } },
        designation: { select: { name: true, designationCode: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  createUser,
  getUsers,
  login,
};
