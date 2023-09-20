const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    userRole: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
