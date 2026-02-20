require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const departmentRoutes = require("./routes/departmentRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);

app.get("/", (req, res) => {
  res.send("HRMS Server API is running");
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
