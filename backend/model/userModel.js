const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: String,
    email: String,
    password: String,
    userRole: String,
    status: { type: String, default: "active" },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
