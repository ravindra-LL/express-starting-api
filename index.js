// Configure New Relic before requiring it
process.env.NEW_RELIC_APP_NAME = "express-api"; // Set a default app name

const express = require("express");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const bcrypt = require("bcrypt");
dotenv.config();

require("newrelic");
const app = express();
const { connectToMongo } = require("./db/mongo.connection");
const port = process.env.PORT || 5000;
const authRouter = require("./routers/auth.router");

connectToMongo();

// Enable CORS for all incoming requests
app.use(cors());

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Ensure express.json() middleware is used before any router to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Changed extended to true to support parsing of arrays and objects
app.use(cookieParser());
app.use("/api/auth", authRouter);

// Serve HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API endpoints for monitoring
app.get("/api/cpu-intensive", (req, res) => {
  // Simulate CPU-intensive operation
  let result = 0;
  for (let i = 0; i < 1000000; i++) {
    result += Math.random() * Math.sqrt(i);
  }
  res.json({ result });
});

app.get("/api/memory-intensive", (req, res) => {
  // Simulate memory-intensive operation
  const largeArray = new Array(1000000).fill("test data");
  res.json({ arrayLength: largeArray.length });
});

app.post("/api/data-processing", (req, res) => {
  // Simulate data processing
  const data = req.body;
  const processedData = {
    receivedAt: new Date(),
    processedFields: Object.keys(data),
    dataSize: JSON.stringify(data).length,
  };
  res.json(processedData);
});

app.post("/api/webhook", (req, res) => {
  console.log(JSON.stringify(req.body, null, 2));
  res.status(200).json({ message: "Webhook received" });
});

// Error simulation endpoint
app.get("/api/simulate-error", (req, res) => {
  try {
    throw new Error("Simulated error for monitoring");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Encrypt password endpoint
app.post("/api/encrypt-password", async (req, res) => {
  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash("Leo@2025", salt);

    res.json({
      hashedPassword,
    });
  } catch (error) {
    console.error("Error encrypting password:", error);
    res.status(500).json({
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`);
});
