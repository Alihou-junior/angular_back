const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
let User = require('../model/user'); 


// Inscrition (POST)
async function register(req, res) {
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
    res.status(200).json({ message: 'Utilisateur créé avec succès' });
}

// Connexion (POST)
async function login(req, res) {
    const { email, password } = req.body;
    
    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Vérifier le mot de passe
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Mot de passe incorrect" });

    // Générer un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "5h" });
    res.status(200).json({ token });
}

// Récupérer les info du user connecté (GET)
async function getProfile(req, res) {
    const user = await User.findById(req.user.id).select("-password"); // On recupere touts les infos du user connecté sauf son mot de passe
    res.status(200).json(user);
}

// Mettre a jour un utilisateur 
async function updateProfile(req, res) {
    try {
        const updates = {};
        const userId = req.user.id; // Récupéré du token via verifyToken
        
        // Vérification si l'email existe déjà pour un autre utilisateur
        if (req.body.email) {
            const existingEmail = await User.findOne({ email: req.body.email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({ message: 'Email déjà utilisé par un autre utilisateur' });
            }
            updates.email = req.body.email;
        }

        // Vérification si le username existe déjà pour un autre utilisateur
        if (req.body.username) {
            const existingUsername = await User.findOne({ username: req.body.username, _id: { $ne: userId } });
            if (existingUsername) {
                return res.status(400).json({ message: 'Username déjà utilisé par un autre utilisateur' });
            }
            updates.username = req.body.username;
        }

        // Autres champs
        if (req.body.name) updates.name = req.body.name;
        if (req.body.surname) updates.surname = req.body.surname;
        if (req.body.image) updates.image = req.body.image;

        // Gestion du mot de passe
        if (req.body.oldPassword && req.body.newPassword) {
            const user = await User.findById(userId);
            if (!user) return res.status(400).json({ message: "Utilisateur non trouvé" });

            const validPassword = await bcrypt.compare(req.body.oldPassword, user.password);
            if (!validPassword) return res.status(400).json({ message: "Ancien mot de passe incorrect" });
            
            updates.password = await bcrypt.hash(req.body.newPassword, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updates,
            { new: true }
        ).select("-password");

        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({
            message: "Erreur lors de la mise à jour de l'utilisateur",
            error: err
        });
    }
}


module.exports = {
    register, 
    login,
    getProfile,
    updateProfile,
}