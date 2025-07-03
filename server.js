const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Imports des middlewares
const verifyToken = require('./middlewares/verifyToken');

// Import des routes 
const user = require('./routes/users');
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

// Configuration de Cloudinary avec mes identifiants (à mettre dans .env)
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



// Route pour users 
app.route(prefix + '/register')
  .post(user.register);

app.route(prefix + '/login')
  .post(user.login);

app.route(prefix + '/profile')
  .get(verifyToken, user.getProfile)
  .put(verifyToken, user.updateProfile);
  




// Démarrer le serveur
app.listen(port, "0.0.0.0");
console.log('Serveur démarré sur http://localhost:' + port);

module.exports = app;