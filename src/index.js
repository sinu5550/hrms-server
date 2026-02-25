require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const designationRoutes = require("./routes/designationRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  "http://localhost:5173",
  "https://hrms-client-siyan.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/designations", designationRoutes);

app.get("/", (req, res) => {
  res.send("HRMS Server API is running");
});

if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
