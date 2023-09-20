const mongoose = require("mongoose");

const jobSchema = mongoose.Schema({
    user: mongoose.Schema.Types.ObjectId,
    company: String,
    logo: String,
    new: Boolean,
    featured: Boolean,
    position: String,
    role: String,
    level: String,
    postedAt: { type: Date, default: Date.now },
    contract: String,
    location: String,
    languages: [String],
    tools: [String],
  });

  module.exports = mongoose.model("Job", jobSchema);