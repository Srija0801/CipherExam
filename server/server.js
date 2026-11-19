const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

//routes
const authRoutes = require("./routes/authRoutes");
const examRoutes = require("./routes/examRoutes");
const centerRoutes = require("./routes/centerRoutes");
const paperRoutes = require("./routes/paperRoutes");
const auditRoutes = require("./routes/auditRoutes");

app.get("/", (req, res) => {
  res.json({
    message: "Secure exam paper distribution system API",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/centers", centerRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/audit", auditRoutes);

//database connection
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("Successfully connected to the database");

    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed", err.message);
  });
