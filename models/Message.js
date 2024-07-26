const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  id: String,
  username: String,
  text: String,
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
