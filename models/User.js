const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: String,
  password_student: String,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
