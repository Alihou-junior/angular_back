let mongoose = require('mongoose');
let Schema = mongoose.Schema;

// Modèle User
const UserSchema = Schema({
  username: String,
  name: String,
  surname: String,
  email: String,
  password: String,
  createdAt: { type: Date, default: Date.now },
  role: { type: String, default: 'user' } ,// 'user' ou 'admin'
  image: { type: String, default: 'https://i.pinimg.com/736x/12/d5/91/12d5916f5595f1fc53407813d2170a8c.jpg' } ,// URL de l'image par défaut
});



// Méthode pour vérifier le mot de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = mongoose.model("User", UserSchema);

