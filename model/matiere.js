let mongoose = require('mongoose');
// on utilise le plugin de pagination
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

let Schema = mongoose.Schema;

let MatiereSchema = Schema({
    id: Number,
    nom: String,
    image: String,
    description: String,
    responsable: {type : Schema.Types.ObjectId, ref: 'User'}
});

// on active la pagination pour ce Schema
MatiereSchema.plugin(aggregatePaginate);


// === Middleware de suppression en cascade :  quand une matiere est supprimer , toute les assignements qui avait cette matiere en référence seront supprimées aussi ===
MatiereSchema.pre('findOneAndDelete', async function(next) {
    const matiereId = this.getQuery()._id;

    await mongoose.model('Assignment').deleteMany({ matiere: matiereId });

    next();
});

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = mongoose.model('Matiere', MatiereSchema);