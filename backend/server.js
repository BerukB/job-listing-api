const express = require("express");
const dotenv = require("dotenv").config();
const {errorHandler} = require('./middleware/errorMiddleware');
const jobs = require("./routes/jobs");
const userRoutes = require("./routes/userRoutes");
const userAuthRoutes = require("./routes/userAuthRoutes");
const dbConnection = require("./config/database");
const port = process.env.PORT;
const cors = require('cors')


dbConnection();
const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/jobs", jobs);
app.use("/api/users", userRoutes);
app.use("/auth/users", userAuthRoutes);

app.use(errorHandler)


app.listen(port, () => console.log(`Server started on ${port}`));

// register login getme
