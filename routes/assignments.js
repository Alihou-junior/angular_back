let mongoose = require('mongoose');
let Assignment = require('../model/assignment');

// TODO 1 : ajouter "getAssignments" sans la pagination  ET "getAssignmentsByMatiereAvecPagination" sans la pagination ( pour etre regulier mais on n'en a pas besoin)
// TODO 2 - IMPORTANT - Ajouter une vérification pour eviter qu'un meme eleve a deux devoir avec les meme noms dans une meme matiere => dans POST 

// Récupérer des assignments selon l'auteur SANS pagination (GET)
function getAssignmentsByAuteur(req, res) {

    // Récupérer l'id de l'auteur 
    const auteurId = req.params.id; 

    // Chercher dans la base de données 
    Assignment.find({auteur: auteurId}, (err, assignments) => {
        if(err) {
            return res.status(500).send({
                message: "Erreur lors de la récupération des devoirs", 
                error: err
            });
        } else {
            res.status(200).json(assignments);
        }
    });
}

// Récupérer tout les assignments AVEC pagination + filtres (GET)
function getAssignmentsAvecPagination(req, res){

    // On regarde si on a page=xxx et limit=yyy dans la query string
    // c'est-à-dire après le ? dans l'URL
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Récupérer les filtres
    const search = req.query.search;
    const matiereId = req.query.matiere; // l’ID de la matière en query
    const rendu = req.query.rendu; 
    
    // Construction dynamique des filtres
    const filters = [];

    if (search) {
        filters.push({
            nom: { $regex: search, $options: 'i' } // recherche insensible à la casse
        });
    }

    if (matiereId) {
        filters.push({
            matiere: new mongoose.Types.ObjectId(matiereId)
        });
    }

    if (rendu === 'true' || rendu === 'false') {
        filters.push({
            rendu: rendu === 'true' // convertit en booléen
        });
    }



    let aggregateQuery = Assignment.aggregate([
        ...(filters.length > 0 ? [{ $match: { $and: filters } }] : []),

        // Jointures 
        {
            $lookup: {
                from: 'matieres',
                localField: 'matiere',
                foreignField: '_id',
                as: 'matiere'
            }
        },
        { $unwind: '$matiere' },
        {
            $lookup: {
                from: 'users',
                localField: 'auteur',
                foreignField: '_id',
                as: 'auteur'
            }
        },
        { $unwind: '$auteur' },
    ]);

    // Pagination
    Assignment.aggregatePaginate(
        aggregateQuery,
        {
            page: page,
            limit: limit,
        }, (err, assignments) => {
            if (err) {
                return res.status(500).send({
                    message: 'Erreur lors de la récupération paginée des devoirs',
                    error: err
                });
            } else {
                res.status(200).send(assignments);
            }

        }
    );


}

// Récupérer des assignments selon l'auteur AVEC pagination + filtres (GET)
function getAssignmentsByAuteurAvecPagination(req, res) {
    
    // Récupérer l'id de l'auteur
    const auteurId = req.params.id ; 

    // page et limit en query string : ?page=1&limit=5
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Récupérer les filtres 
    const search = req.query.search;
    const matiereId = req.query.matiere; // l’ID de la matière en query
    const rendu = req.query.rendu;

    // Construction dynamique des filtres
    const filters = [];

    filters.push({
        auteur: new mongoose.Types.ObjectId(auteurId)
    });

    if (search) {
        filters.push({
            nom: { $regex: search, $options: 'i' } // recherche insensible à la casse
        });
    }

    if (matiereId) {
        // Si matiereId contient des virgules, on le split en tableau
        const matiereIds = matiereId.includes(',') 
            ? matiereId.split(',').map(id => new mongoose.Types.ObjectId(id))
            : [new mongoose.Types.ObjectId(matiereId)];


        filters.push({
            matiere: { $in: matiereIds } // Utilisation de $in pour plusieurs valeurs
        });
    }

    if (rendu === 'true' || rendu === 'false') {
        filters.push({
            rendu: rendu === 'true' // convertit en booléen
        });
    }

    let aggregateQuery = Assignment.aggregate([

        ...(filters.length > 0 ? [{ $match: { $and: filters } }] : []),
        {
            $lookup: {
                from: 'matieres',
                localField: 'matiere',
                foreignField: '_id',
                as: 'matiere'
            }
        },
        { $unwind: '$matiere' },
        {
            $lookup: {
                from: 'users',
                localField: 'auteur',
                foreignField: '_id',
                as: 'auteur'
            }
        },
        { $unwind: '$auteur' },
    ]);


    // Pagination
    Assignment.aggregatePaginate(
        aggregateQuery,
        {
            page: page,
            limit: limit,
        }, (err, assignments) => {
            if (err) {
                return res.status(500).send({
                    message: 'Erreur lors de la récupération paginée des devoirs',
                    error: err
                });
            } else {
                res.status(200).send(assignments);
            }

            
        }
    );
}

// Récupérer des assignments selon la matiere AVEC pagination + filtres (GET)
function getAssignmentsByMatiereAvecPagination(req, res) {

    // Récuperer l'id de la matière 
    const matiereId = req.params.id;

    // page et limit en query string : ?page=1&limit=5
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Récupérer les filtres 
    const search = req.query.search;
    const rendu = req.query.rendu;

    // Construction dynamique des filtres
    const filters = [];

    filters.push({
        matiere: new mongoose.Types.ObjectId(matiereId)
    });

    if (search) {
        filters.push({
            nom: { $regex: search, $options: 'i' } // recherche insensible à la casse
        });
    }


    if (rendu === 'true' || rendu === 'false') {
        filters.push({
            rendu: rendu === 'true' // convertit en booléen
        });
    }

    let aggregateQuery = Assignment.aggregate([

        ...(filters.length > 0 ? [{ $match: { $and: filters } }] : []),
        {
            $lookup: {
                from: 'matieres',
                localField: 'matiere',
                foreignField: '_id',
                as: 'matiere'
            }
        },
        { $unwind: '$matiere' },
        {
            $lookup: {
                from: 'users',
                localField: 'auteur',
                foreignField: '_id',
                as: 'auteur'
            }
        },
        { $unwind: '$auteur' },
    ]);


    // Pagination
    Assignment.aggregatePaginate(
        aggregateQuery,
        {
            page: page,
            limit: limit,
        }, (err, assignments) => {
            if (err) {
                return res.status(500).send({
                    message: 'Erreur lors de la récupération paginée des devoirs',
                    error: err
                });
            } else {
                res.status(200).send(assignments);
            }

            
        }
    );
}

// Récupérer un assignment par son id (GET)
function getAssignment(req, res){

    // Récupérer l'id de assignment
    let assignmentId = req.params.id;

    // Chercher dans la base de données
    Assignment.findById(assignmentId)
        .populate('auteur') 
        .exec((err, assignment) =>{
        if (err) {
            return res.status(500).send({
                message: "Erreur lors de la récupération du devoir" ,
                error: err
            })
        } else {
            res.status(200).json(assignment);
        }
        
        })
}

// Ajout d'un assignment (POST)
function postAssignment(req, res){

    // Création du devoir
    let assignment = new Assignment();
    assignment.nom = req.body.nom ;   // Champ obligatoire => Toujours donnée
    assignment.dateDeRendu = req.body.dateDeRendu ; // Champ obligatoire  
    assignment.auteur = req.body.auteur ; // On récupère dans l'id dans le body  c'est mieux je pense pour la sécu ... 
    assignment.matiere = req.body.matiere ; 
    assignment.rendu = false ; //  a la création , le devoir n'est pas encore rendu
    assignment.note = null ; // a la création , le devoir n' est pas encore noté , cette partie est réservé au prof
    assignment.remarques = null; // a la création , le devoir n'a pas encore de remarques , cette partie est réservé au prof 


    // Sauvegarde dans MongoDB
    assignment.save( (err, createdAssignment) => {
        if (err) {
            return res.status(500).send({
                message: 'Erreur lors de la création de votre devoir',
                error: err
            });
        } else {
            res.status(200).json(createdAssignment);
        }
        
    });
}

// Update d'un assignment (PUT)
function updateAssignment(req, res) {

    // Récupérer id de l'assignment
    const assignmentId = req.params.id;

    // Ajout des champ a modifier 
    const assignment = {} ; 
    if (req.body.nom && req.body.nom != "") {assignment.nom = req.body.nom } 
    if (req.body.dateDeRendu && req.body.dateDeRendu != "") {assignment.dateDeRendu = req.body.dateDeRendu}
    if (req.body.rendu && req.body.rendu != "") { assignment.rendu = req.body.rendu}
    if (req.body.matiereId && req.body.matiereId != "") {assignment.matiere = req.body.matiereId}
    if (req.body.remarques && req.body.remarques != "") {assignment.remarques = req.body.remarques}
    if (req.body.note) {assignment.note = req.body.note}

    // Mise à jour dans la base de données
    Assignment.findByIdAndUpdate(assignmentId, assignment, {new: true}, (err, updatedAssignment) => {
        if (err) {
            return res.status(500).send({
                message: "Erreur lors de la mise a jour de votre devoir" ,
                error: err
            });
        } else {
            res.status(200).json(updatedAssignment);
        }

    });

}

// Suppression d'un assignment (DELETE)
function deleteAssignment(req, res) {
    
    // Récupérer l'id de l'assignment
    const assignmentId = req.params.id ;

    // Suppression dans la base de données
    Assignment.findByIdAndRemove(assignmentId, (err, deletedAssignment) => {
        if (err) {
            return res.status(500).send({
                message: "Erreur lors de la suppression du devoir", 
                error: err
            });
        } else {
            res.status(200).json(deletedAssignment);
        }
        
    })
}



module.exports = { 
    getAssignmentsAvecPagination,
    getAssignmentsByAuteur,
    getAssignmentsByAuteurAvecPagination,
    getAssignmentsByMatiereAvecPagination,
    postAssignment,
    getAssignment,
    updateAssignment,
    deleteAssignment 
};
