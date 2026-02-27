require("dotenv").config();
const express = require("express");
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const designationRoutes = require("./routes/designationRoutes");
const payrollRoutes = require("./routes/payrollRoutes");

const allowedOrigins = [
  "http://localhost:5173",
  "https://hrms-client-siyan.vercel.app",
];

const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

const PORT = process.env.PORT || 5000;

// Attach socket.io to req for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

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
app.use("/api/payroll", payrollRoutes);

app.get("/", (req, res) => {
  res.send("HRMS Server API is running");
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("🔥 GLOBAL ERROR CAUGHT 🔥");
  console.error(err);
  if (err instanceof Error) {
    console.error(err.stack);
  } else {
    console.error("Error Object Stringified:", JSON.stringify(err, null, 2));
  }

  res.status(500).json({
    error:
      err.message ||
      "An unexpected server error occurred during upload or processing.",
    details: err,
  });
});

if (process.env.NODE_ENV !== "production") {
  httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

module.exports = app;
