const express = require("express");
const Joi = require("joi");
const dotenv = require("dotenv").config();
const jobs = require("./routes/jobs");
const userRoutes = require("./routes/userRoutes");
const userAuthRoutes = require("./routes/userAuthRoutes");
const dbConnection = require("./config/database");
const port = process.env.PORT;

dbConnection();
const app = express();

app.use(express.json());
app.use("/api/jobs", jobs);
app.use("/api/users", userRoutes);
app.use("/auth/users", userAuthRoutes);

app.listen(port, () => console.log(`Server started on ${port}`));

// register login getme
