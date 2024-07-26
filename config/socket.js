const socketIo = require("socket.io");
const User = require("../models/User");
const Message = require("../models/Message");
const bcrypt = require("bcryptjs");

let connectedUsers = new Set();

module.exports = (server) => {
  const io = socketIo(server);

  io.on("connection", function (socket) {
    console.log("New client connected", socket.id);

    socket.on("newuser", async function ({ username, password_student }) {
      console.log("New user attempted to connect:", username);
      const userIdentifier = `${username}-${password_student}`;

      if (connectedUsers.has(userIdentifier)) {
        socket.emit("username-taken", "Ce nom d'utilisateur est déjà connecté");
        return;
      }

      const user = await User.findOne({ username });
      if (!user) {
        socket.emit(
          "auth-error",
          "Nom d'utilisateur ou mot de passe incorrect"
        );
        return;
      }

      const isMatch = await bcrypt.compare(
        password_student,
        user.password_student
      );
      if (!isMatch) {
        socket.emit(
          "auth-error",
          "Nom d'utilisateur ou mot de passe incorrect"
        );
        return;
      }

      connectedUsers.add(userIdentifier);
      socket.username = username;
      socket.password_student = password_student;

      socket.emit("auth-success");
      socket.broadcast.emit("update");

      const messages = await Message.find();
      socket.emit("load-messages", messages);
    });

    socket.on("exituser", function ({ username, password_student }) {
      console.log("User exiting:", username);
      const userIdentifier = `${username}-${password_student}`;
      connectedUsers.delete(userIdentifier);
      socket.broadcast.emit("update");
    });

    socket.on("disconnect", function () {
      if (socket.username && socket.password_student) {
        const userIdentifier = `${socket.username}-${socket.password_student}`;
        connectedUsers.delete(userIdentifier);
        console.log("User disconnected:", socket.username);
      }
    });

    socket.on("chat", async function (message) {
      console.log("New chat message:", message);
      const newMessage = new Message(message);
      await newMessage.save();
      socket.broadcast.emit("chat", message);
    });

    socket.on("delete-message", async function (messageId) {
      console.log("Deleting message:", messageId);
      const message = await Message.findOne({ id: messageId });

      if (message && message.username === socket.username) {
        await Message.deleteOne({ id: messageId });
        io.emit("delete-message", messageId);
      }
    });

    socket.on("edit-message", async function ({ messageId, newText }) {
      console.log("Editing message:", messageId, newText);
      const message = await Message.findOne({ id: messageId });

      if (message && message.username === socket.username) {
        message.text = newText;
        await message.save();
        io.emit("edit-message", { messageId, newText });
      }
    });
  });
};
