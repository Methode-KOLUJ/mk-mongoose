const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, "../App Academique")));

// Route principale
app.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../App Academique/Culture generale/index.html")
  );
});

module.exports = app;
