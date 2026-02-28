const prisma = require("../lib/prisma");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "fallback_secret";

const createUser = async (req, res) => {
  try {
    const data = req.body || {};
    const files = req.files || {};

    if (!data.email) {
      return res.status(400).json({ error: "Email is required" });
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

    let hashedPassword = null;
    if (data.password) {
      hashedPassword = await bcrypt.hash(data.password, 10);
    }

    // Handle File URLs
    const profilePhotoUrl = files.profilePhoto
      ? files.profilePhoto[0].path
      : null;
    const resumeUrl = files.resume ? files.resume[0].path : null;
    const certificateFiles = files.certificates || [];

    const newUser = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
        firstName: data.firstName,
        lastName: data.lastName,
        username: data.username,
        role: data.role || "EMPLOYEE",
        employeeId: newEmpId,
        phone: data.phone,
        company: data.company,
        about: data.about,
        departmentId: data.departmentId,
        designationId: data.designationId,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : null,

        // New Fields
        profilePhotoUrl,
        resumeUrl,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        gender: data.gender,
        maritalStatus: data.maritalStatus,
        nationality: data.nationality,
        identificationNo: data.identificationNo,
        ssnNo: data.ssnNo,
        passportNo: data.passportNo,
        emergencyContactName: data.emergencyContactName,
        emergencyContactPhone: data.emergencyContactPhone,
        privateAddress: data.privateAddress,
        dependentChildren: data.dependentChildren
          ? parseInt(data.dependentChildren)
          : 0,
        placeOfBirth: data.placeOfBirth,
        visaNo: data.visaNo,
        workPermitNo: data.workPermitNo,
        privateEmail: data.privateEmail,
        privatePhone: data.privatePhone,
        bankAccounts: data.bankAccounts,
        certificateLevel: data.certificateLevel,
        fieldOfStudy: data.fieldOfStudy,

        certificates: {
          create: certificateFiles.map((file) => ({
            name: file.originalname,
            url: file.path,
          })),
        },
      },
      include: {
        certificates: true,
        department: { select: { name: true, departmentCode: true } },
        designation: { select: { name: true, designationCode: true } },
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
      user: newUser,
      token,
    });

    // Emit socket event
    if (req.io) {
      req.io.emit("userCreated", newUser);
    }
  } catch (error) {
    console.error("Error creating user:", error);
    if (error.code === "P2002") {
      const field = error.meta?.target?.[0] || "field";
      return res.status(400).json({
        error: `User with this ${field} already exists. Please use a unique ${field}.`,
      });
    }
    res.status(500).json({
      error: error.message || "Internal server error during user creation",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body || {};
    const files = req.files || {};

    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: { certificates: true },
    });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = {
      email: data.email || existingUser.email,
      firstName:
        data.firstName !== undefined ? data.firstName : existingUser.firstName,
      lastName:
        data.lastName !== undefined ? data.lastName : existingUser.lastName,
      username:
        data.username !== undefined ? data.username : existingUser.username,
      phone: data.phone !== undefined ? data.phone : existingUser.phone,
      company: data.company !== undefined ? data.company : existingUser.company,
      about: data.about !== undefined ? data.about : existingUser.about,
      departmentId:
        data.departmentId !== undefined
          ? data.departmentId
          : existingUser.departmentId,
      designationId:
        data.designationId !== undefined
          ? data.designationId
          : existingUser.designationId,
      joiningDate: data.joiningDate
        ? new Date(data.joiningDate)
        : existingUser.joiningDate,

      // New Fields
      gender: data.gender !== undefined ? data.gender : existingUser.gender,
      maritalStatus:
        data.maritalStatus !== undefined
          ? data.maritalStatus
          : existingUser.maritalStatus,
      nationality:
        data.nationality !== undefined
          ? data.nationality
          : existingUser.nationality,
      identificationNo:
        data.identificationNo !== undefined
          ? data.identificationNo
          : existingUser.identificationNo,
      ssnNo: data.ssnNo !== undefined ? data.ssnNo : existingUser.ssnNo,
      passportNo:
        data.passportNo !== undefined
          ? data.passportNo
          : existingUser.passportNo,
      emergencyContactName:
        data.emergencyContactName !== undefined
          ? data.emergencyContactName
          : existingUser.emergencyContactName,
      emergencyContactPhone:
        data.emergencyContactPhone !== undefined
          ? data.emergencyContactPhone
          : existingUser.emergencyContactPhone,
      privateAddress:
        data.privateAddress !== undefined
          ? data.privateAddress
          : existingUser.privateAddress,
      dependentChildren:
        data.dependentChildren !== undefined
          ? parseInt(data.dependentChildren)
          : existingUser.dependentChildren,
      placeOfBirth:
        data.placeOfBirth !== undefined
          ? data.placeOfBirth
          : existingUser.placeOfBirth,
      visaNo: data.visaNo !== undefined ? data.visaNo : existingUser.visaNo,
      workPermitNo:
        data.workPermitNo !== undefined
          ? data.workPermitNo
          : existingUser.workPermitNo,
      privateEmail:
        data.privateEmail !== undefined
          ? data.privateEmail
          : existingUser.privateEmail,
      privatePhone:
        data.privatePhone !== undefined
          ? data.privatePhone
          : existingUser.privatePhone,
      bankAccounts:
        data.bankAccounts !== undefined
          ? data.bankAccounts
          : existingUser.bankAccounts,
      certificateLevel:
        data.certificateLevel !== undefined
          ? data.certificateLevel
          : existingUser.certificateLevel,
      fieldOfStudy:
        data.fieldOfStudy !== undefined
          ? data.fieldOfStudy
          : existingUser.fieldOfStudy,
      role: data.role ?? existingUser.role,
    };

    if (data.firstName || data.lastName) {
      updateData.name =
        `${data.firstName || existingUser.firstName || ""} ${data.lastName || existingUser.lastName || ""}`.trim();
    }

    if (data.dateOfBirth) {
      updateData.dateOfBirth = new Date(data.dateOfBirth);
    }

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    // Handle File URLs
    if (files.profilePhoto) {
      updateData.profilePhotoUrl = files.profilePhoto[0].path;
    }
    if (files.resume) {
      updateData.resumeUrl = files.resume[0].path;
    }

    if (files.certificates) {
      updateData.certificates = {
        create: files.certificates.map((file) => ({
          name: file.originalname,
          url: file.path,
        })),
      };
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        certificates: true,
        department: true,
        designation: true,
        salaries: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    });

    // Emit socket event
    if (req.io) {
      req.io.emit("userUpdated", updatedUser);
    }
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body || {};

    if (!role) {
      return res.status(400).json({ error: "Role is required" });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role,
      },
      include: {
        department: { select: { name: true, departmentCode: true } },
        designation: { select: { name: true, designationCode: true } },
        certificates: true,
        salaries: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    res.json({
      message: "Role updated successfully",
      user: updatedUser,
    });

    if (req.io) {
      req.io.emit("userUpdated", updatedUser);
    }
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        department: { select: { name: true, departmentCode: true } },
        designation: { select: { name: true, designationCode: true } },
        certificates: true,
        salaries: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: { select: { name: true, departmentCode: true } },
        designation: { select: { name: true, designationCode: true } },
        certificates: true,
        salaries: {
          orderBy: { createdAt: "desc" },
        },
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
    const { email, password } = req.body || {};

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
  getUserById,
  updateUser,
  updateUserRole,
  login,
};
