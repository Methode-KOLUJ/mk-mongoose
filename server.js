const http = require("http");
const app = require("./config/index");
const mongoose = require("./db/connection");
const setupSocket = require("./config/socket");
const cors = require("cors");
const Score = require("./models/Score");
const session = require("express-session");

require("dotenv").config();

const server = http.createServer(app);
setupSocket(server);
app.use(cors());

const User = require("./models/User");
const Message = require("./models/Message");
const bcrypt = require("bcryptjs");

//Gestion des session et authentification

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

// Route pour ajouter un utilisateur
app.post("/add-user", async (req, res) => {
  const { username, password, password_student } = req.body;

  if (password !== process.env.ADMIN) {
    return res.status(403).json({ message: "Mot de passe incorrect !" });
  }

  const userExists = await User.findOne({ username });
  if (userExists) {
    return res.status(400).json({ message: "L'utilisateur existe déjà !" });
  }

  const hashedPassword = await bcrypt.hash(password_student, 10);

  const newUser = new User({ username, password_student: hashedPassword });
  await newUser.save();

  res.status(200).json({ message: "Utilisateur ajouté avec succès !" });
});

// Vérification du mot de passe MK
app.post("/validate-password", async (req, res) => {
  const { username, password_student } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return res.json({ valid: false });
  }

  const isMatch = await bcrypt.compare(password_student, user.password_student);
  if (!isMatch) {
    return res.json({ valid: false });
  }

  res.json({ valid: true });
});

// Fonction pour ajouter ou mettre à jour l'administrateur
async function addOrUpdateAdmin() {
  const username = process.env.ADMINISTRATEUR;
  const plainPassword = process.env.ADMIN;

  if (!username || !plainPassword) {
    console.error("Cet Administrateur n'est pas reconnu");
    return;
  }
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  const admin = await User.findOneAndUpdate(
    { username },
    { username, password_student: hashedPassword },
    { upsert: true, new: true }
  );
  console.log(`l'Administrateur ${username} a été ajouté`);
}

addOrUpdateAdmin();

// Routes && Fonction pour sauvegarder les données

async function saveScore({
  username,
  Titre,
  score,
  progressPercentage,
  submissionDate,
  submissionTime,
}) {
  const newScore = new Score({
    username,
    Titre,
    score,
    progressPercentage,
    submissionDate,
    submissionTime,
  });

  try {
    await newScore.save();
    console.log("Le score est enregistré avec succès");
  } catch (err) {
    console.error("Erreur d'enregistrement du score :", err);
  }
}

app.post("/save-score", (req, res) => {
  const { username, Titre, score, progressPercentage } = req.body;
  const now = new Date();
  const submissionDate = formatDate(now);
  const submissionTime = now.toTimeString().split(" ")[0]; // Format HH:MM:SS

  saveScore({
    username,
    Titre,
    score,
    progressPercentage,
    submissionDate,
    submissionTime,
  })
    .then(() => res.status(200).json({ message: "Score saved successfully" }))
    .catch((err) =>
      res.status(500).json({ message: "Error saving score", error: err })
    );
});

function formatDate(date) {
  const days = [
    "Dimanche",
    "Lundi",
    "Mardi",
    "Mercredi",
    "Jeudi",
    "Vendredi",
    "Samedi",
  ];
  const dayName = days[date.getDay()];
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${dayName} ${day}-${month}-${year}`;
}

// Route pour récupérer les scores
app.get("/get-scores", async (req, res) => {
  const { username, Titre } = req.query;
  try {
    const scores = await Score.find({
      $or: [{ username: username }, { Titre: Titre }],
    });
    res.json(scores);
  } catch (error) {
    res.status(500).send("Error retrieving scores");
  }
});

// Démarrage du serveur
server.listen(5000, () => {
  console.log(`Le serveur marche au port 5000 !`);
});
