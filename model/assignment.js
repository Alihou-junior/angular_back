let mongoose = require('mongoose');
// on utilise le plugin de pagination
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

let Schema = mongoose.Schema;

let AssignmentSchema = Schema({
    id: Number,
    dateDeRendu: Date,
    nom: String,
    rendu: Boolean , 
    auteur: String , 
    matiere : {
        nom: String,
        image : String, 
        ImageProf: String
    }, 
    remarques : String, 
    note : Number
});

// on active la pagination pour ce Schema
AssignmentSchema.plugin(aggregatePaginate);

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = mongoose.model('Assignment', AssignmentSchema);
