let mongoose = require('mongoose');
// on utilise le plugin de pagination
var aggregatePaginate = require("mongoose-aggregate-paginate-v2");

let Schema = mongoose.Schema;

let AssignmentSchema = Schema({
    id: Number,
    dateDeRendu: Date,
    nom: String,
    rendu: Boolean , 
    auteur: {type: Schema.Types.ObjectId, ref: 'User'} , 
    matiere : {type : Schema.Types.ObjectId, ref: 'Matiere'}, 
    remarques : String, 
    note : Number
});

// on active la pagination pour ce Schema
AssignmentSchema.plugin(aggregatePaginate);

// C'est à travers ce modèle Mongoose qu'on pourra faire le CRUD
module.exports = mongoose.model('Assignment', AssignmentSchema);
