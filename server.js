const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const assignment = require('./routes/assignments');
const matiere = require('./routes/matiere');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// 
const uri = process.env.MONGO_URI ;

const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};

mongoose.connect(uri, options)
  .then(() => {
    console.log("Connecté à la base MongoDB assignments dans le cloud !");
    console.log("at URI = " + uri);
    console.log("vérifiez with http://localhost:8010/api/assignments que cela fonctionne");
    console.log("vérifiez with http://localhost:8010/api/matieres que cela fonctionne");
  })
  .catch(err => {
    console.log('Erreur de connexion: ', err);
  });

// Middleware pour CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
});

// Middleware pour parser le corps des requêtes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8010;
const prefix = '/api';

// Modèle User
const UserSchema = new mongoose.Schema({
  username: String,
  name: String,
  surname: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  role: { type: String, default: 'user' } ,// 'user' ou 'admin'
  image: { type: String, default: 'https://i.pinimg.com/736x/12/d5/91/12d5916f5595f1fc53407813d2170a8c.jpg' } ,// URL de l'image par défaut
});


// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
const User = mongoose.model("User", UserSchema);

// Middleware pour vérifier le token JWT
const verifyToken = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).json({ message: "Accès refusé" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token invalide" });
  }
};

// Routes pour les assignments
app.route(prefix + '/assignments')
  .get(assignment.getAssignmentsAvecPagination)
  .post(assignment.postAssignment)
  .put(assignment.updateAssignment);

app.route(prefix + '/assignments/:id')
  .get(assignment.getAssignment)
  .delete(assignment.deleteAssignment);


// Routes pour les matières
app.route(prefix + '/matieres')
  .get(matiere.getMatieres)
  .put(matiere.updateMatiere);

app.route(prefix + '/matieres/paginated')
  .get(matiere.getMatieresAvecPagination);

app.route(prefix + '/matieres/:id')
  .get(matiere.getMatiereById)
  .post(matiere.postMatiere)
  .delete(matiere.deleteMatiere);

app.route(prefix + '/matieres/responsable/:id')
  .get(matiere.getMatieresByResponsable);

app.route(prefix + '/matieres/responsable/:id/paginated')
  .get(matiere.getMatieresByResponsableAvecPagination);





// Route : Inscription
app.post(prefix + '/register', async (req, res) => {
  const { username, name, surname, email, password , role} = req.body;

  // Vérification des données
  if (!username || !email || !password || !name || !surname) {
    return res.status(400).json({ message: 'Champs obligatoires manquants' });
  }

  // Vérifier si l'email existe déjà
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email déjà utilisé' });
  }

  // Validation du rôle
  if (role && !['user', 'admin'].includes(role)) {
    return res.status(400).json({ message: 'Rôle invalide' });
  }

  // Hacher le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer un nouvel utilisateur
  const newUser = new User({
    username,
    name,
    surname,
    email,
    password: hashedPassword,
    role: role 
  });

  await newUser.save();
  res.json({ message: 'Utilisateur créé avec succès' });
});

// Route : Connexion
app.post(prefix + '/login', async (req, res) => {
  const { email, password } = req.body;

  // Vérifier si l'utilisateur existe
  const user = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

  // Vérifier le mot de passe
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).json({ message: "Mot de passe incorrect" });

  // Générer un token JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5h" });
  res.json({ token });
});

// Route : Profil utilisateur (Protégée)
app.get(prefix + '/profile', verifyToken, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// Démarrer le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;