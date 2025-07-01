const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

//const verifyToken = require('./middlewares/verifyToken');
//const user = require('./route/users');
const assignment = require('./routes/assignments');
const matiere = require('./routes/matieres');
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

/* // Middleware pour CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  next();
}); */

// Middleware dynamique
/* app.use(cors({
  origin: (origin, callback) => {
    callback(null, origin || '*'); // Autorise toutes les origines explicitement
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
})); */

// Configure CORS
app.use(cors({
  origin: ['http://localhost:4200', 'https://assignment-app-final.onrender.com'], // Allow requests from Angular frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow Authorization header
  credentials: true // If you need to send cookies or other credentials
}));

// Middleware pour parser le corps des requêtes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8010;
const prefix = '/api';

const multer = require('multer');  
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration de Cloudinary avec vos identifiants (à mettre dans .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // Nom du cloud Cloudinary
  api_key: process.env.CLOUDINARY_API_KEY,        // Clé API trouvée sur le dashboard
  api_secret: process.env.CLOUDINARY_API_SECRET   // Clé secrète trouvé sur le dashboard
});

// Configuration du stockage Cloudinary avec Multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary, // On utilise la config Cloudinary définie plus haut
  params: {
    folder: 'AssignmentApp',   // Toutes les images iront dans un dossier "AssignmentApp" sur Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],  // Formats autorisés
    quality: 'auto:good' // Compression optimale
  }
});

// Initialisation de Multer avec le stockage Cloudinary
const upload = multer({ 
  storage: storage, 
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB max
});
  


// Route POST pour uploader une image
app.post(prefix + '/upload/image', upload.single('image'), async (req, res) => {
  try {
    // Vérification si un fichier a été envoyé
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier uploadé' });
    }

    // Réponse avec l'URL de l'image sur Cloudinary
    res.status(200).json({ 
      success: true,
      imageUrl: req.file.path // Exemple : "https://res.cloudinary.com/votre-cloud/image/upload/v123456/matieres/image.jpg"
    });
  } catch (error) {
    console.error("Erreur lors de l'upload :", error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'upload',
      error: error.message 
    });
  }
});


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
  .post(assignment.postAssignment);

app.route(prefix + '/assignments/paginated')
  .get(assignment.getAssignmentsAvecPagination)

app.route(prefix + '/assignments/:id')
  .get(assignment.getAssignment)
  .put(assignment.updateAssignment)
  .delete(assignment.deleteAssignment);

app.route(prefix + '/assignments/auteur/:id')
  .get(assignment.getAssignmentsByAuteur);

app.route(prefix + '/assignments/auteur/:id/paginated')
  .get(assignment.getAssignmentsByAuteurAvecPagination);

app.route(prefix + '/assignments/matiere/:id/paginated')
  .get(assignment.getAssignmentsByMatiereAvecPagination);


// Routes pour les matières
app.route(prefix + '/matieres')
  .get(matiere.getMatieres)
  .post(matiere.postMatiere)

app.route(prefix + '/matieres/paginated')
  .get(matiere.getMatieresAvecPagination);

app.route(prefix + '/matieres/:id')
  .get(matiere.getMatiereById)
  .put(matiere.updateMatiere)
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