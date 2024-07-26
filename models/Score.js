const mongoose = require("mongoose");

const scoreSchema = new mongoose.Schema({
  username: { type: String, required: true },
  Titre: { type: String, required: true },
  score: { type: Number, required: true },
  progressPercentage: { type: String, required: true },
  submissionDate: { type: String, required: true },
  submissionTime: { type: String, required: true },
});

module.exports = mongoose.model("Score", scoreSchema);
