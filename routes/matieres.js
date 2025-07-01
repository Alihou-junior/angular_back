let mongoose = require('mongoose');
let Matiere = require('../model/matiere');



// Récupérer toutes les matières SANS pagination (GET)
function getMatieres(req, res) {

    // Récupérer le terme de recherche depuis la query string, par ex. ?search=math
    const search = req.query.search;

    // Construction de la requête de recherche si un mot-clé est fourni
    const query = search
        ? { nom: { $regex: search, $options: 'i' } } // recherche insensible à la casse
        : {}; // sinon on récupère tout

    // Chercher dans la base de données
    Matiere.find(query)
        .populate('responsable') // remplace l'ObjectId par les infos du user
        .exec((err, matieres) => {
            if (err) {
                return res.status(500).send({
                    message: 'Erreur lors de la récupération des matières', 
                    error: err
                });
            } else {
                res.status(200).json(matieres);
            }
            
        });
}

// Récupérer les matieres selon le responsable SANS pagination (GET)
function getMatieresByResponsable(req, res) {

    // Récuperer l'id du user
    let responsableId = req.params.id;
    
    // Chercher dans la base de données
    Matiere.find({ responsable: responsableId }, (err, matieres) => {
        if (err) {
            return res.status(500).send({
                message: "Erreur lors de la recuperation des matieres", 
                error: err
            });
        }

        res.status(200).json(matieres);
    });
}

// Récupérer les matieres AVEC pagination + filtres (GET)
function getMatieresAvecPagination(req, res) { 
    // On regarde si on a page=xxx et limit=yyy dans la query string
    // c'est-à-dire après le ? dans l'URL
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // récupérer les filtres 
    const search = req.query.search;
    const responsableId = req.query.responsable;

    // Construction dynamique des filtres
    const filters = [];

    if (search) {
        filters.push({
            nom: { $regex: search, $options: 'i' } // recherche insensible à la casse
        });
    }

    if (responsableId) {
        filters.push({
            responsable: new mongoose.Types.ObjectId(responsableId) 
        });
    }

    // requête de recherche avec paginate
    let aggregateQuery = Matiere.aggregate([
        // Filtre
         ...(filters.length > 0 ? [{ $match: { $and: filters } }] : []), /* ... est l’opérateur de décomposition (spread) en JavaScript.*/ 

        // Jointure avec la collection 'users' pour récupérer le responsable
        {
            $lookup: {
                from: 'users',
                localField: 'responsable',
                foreignField: '_id',
                as: 'responsable'
            }
        },

        // Traansformer le tableau 'responsable' (qui contient 1 seul élément) en objet simple
        { $unwind: '$responsable' }
    ]);


    // Pagination
    Matiere.aggregatePaginate(
        aggregateQuery,
        {
            page: page,
            limit: limit,
        }, (err, matieres) => {
            if (err) {
                return res.status(500).send({
                    message: 'Erreur lors de la récupération paginée des matières',
                    error: err
                });
            } else {
                res.status(200).send(matieres);
            }
   
        }
    );
}

// Récupérer les matieres selon le responsable AVEC pagination + filtres (GET)
function getMatieresByResponsableAvecPagination(req, res) {

    // Récuperer l'id du user
    let responsableId = req.params.id;
    
    // page et limit en query string : ?page=1&limit=5
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // Récuprer filtres 
    const search = req.query.search;

    // construction dynamique du filtre 
    const filters = [];

    filters.push({
        responsable: new mongoose.Types.ObjectId(responsableId)
    });

    if (search) {
        filters.push({
            nom: { $regex: search, $options: 'i' } // recherche insensible à la casse
        });
    }



    
    const aggregateQuery = Matiere.aggregate([
        ...(filters.length > 0 ? [{ $match: { $and: filters } }] : []),

        {
            $lookup: {
                from: 'users',
                localField: 'responsable',
                foreignField: '_id',
                as: 'responsable'
            }
        },
        { $unwind: '$responsable' },
        
    ]);

    // Pagination
        Matiere.aggregatePaginate(
            aggregateQuery,
            {
                page: page,
                limit: limit,
            }, (err, matieres) => {
                if (err) {
                    return res.status(500).send({
                        message: 'Erreur lors de la récupération paginée des matières',
                        error: err
                    });
                } else {
                    res.status(200).send(matieres);
                }
    
                
            }
        );
}

// Récupérer une matière par son id (GET)
function getMatiereById(req, res) {

    // Récupérer l'id de la matière
    let matiereId = req.params.id;

    // Chercher dans la BD
    Matiere.findById(matiereId)
        .populate('responsable') // Remplit automatiquement les infos du prof/responsable
        .exec((err, matiere) => {
            if (err) {
                return res.status(500).send({
                    message: "Erreur lors de la récupération de la matière",
                    error: err
                });
            }

            if (!matiere) {
                return res.status(404).send({
                    message: "Matière non trouvée"
                });
            }

            res.status(200).json(matiere);
        });
}


// Ajout d'une matière (POST)
function postMatiere(req, res) {

    // Creation de la matière 
    let matiere = new Matiere(); 
    matiere.nom = req.body.nom;
    matiere.description = req.body.description;
    matiere.responsable = req.body.responsable;
    
    // verifier qu'une image a été choisit sinon mettre image de defaut 
    if(req.body.image && req.body.image != "") {
        matiere.image = req.body.image;
    } else {
        matiere.image = 'https://i.pinimg.com/736x/82/75/ea/8275ea5e8c59e1f95401a6bd72566d41.jpg';
    }

    

    // Vérifier qu'une matière du même nom n'existe pas déjà pour ce prof
    Matiere.findOne({ nom: matiere.nom, responsable: matiere.responsable }, (err, existingMatiere) => {
        if (err) {
            return res.status(500).send({
                message: "Erreur lors de la vérification de la matière existante",
                error: err
            });
        }

        if (existingMatiere) {
            return res.status(400).send({
                message: "Une matière avec ce nom existe déjà pour ce responsable"
            });
        }

        // Sauvegarde dans MongoDB
        matiere.save((err, newMatiere) => {
            if (err) {
                return res.status(500).send({
                    message: "Erreur lors de la création de la matière",
                    error: err
                });
            } else {
                res.status(200).json(newMatiere);
            }
        });
    });
}

//  Modifier une matière (PUT)
function updateMatiere(req, res) {

    // Récuperer l'id de la matière 
    const matiereId = req.params.id;

    // Ajout des champs à modifier
    const matiere = {} ; 

    if (req.body.nom != undefined && req.body.nom != "") {matiere.nom = req.body.nom} ;
    if (req.body.image !== undefined && req.body.image != "") {matiere.image = req.body.image};
    if (req.body.description !== undefined && req.body.description != "") {matiere.description = req.body.description} ;


    // Modifier dans la base de données
    Matiere.findByIdAndUpdate(matiereId, matiere, { new: true }, (err, updatedMatiere) => {
        if (err) {
            console.log(err);
            return res.status(500).send({
                message: "Erreur lors de la mise a jour de la matiere", 
                error: err
            });
        } else {
            res.status(200).json(updatedMatiere);
        }
    });
}

// Supprimer une matiere (DELETE)
function deleteMatiere(req,res) {
    
    // Récupérer l'id de la matiere 
    const matiereId = req.params.id;

    // Supression de la matiere dans la base de données - les assignments qui ont pour reference la matiere seront aussi supprimées ( voir model/Matiere)
    Matiere.findOneAndDelete({ _id: matiereId}, (err, deletedMatiere) => {
        if(err){
            return res.status(500).send({
                message: "Erreur lors de la suppression de la matiere", 
                error: err
            });
        } else {
            res.status(200).json({
                message:"suppression de la matiere : ",
                matiere: deletedMatiere,
            });
        }

    })

}


module.exports = {
    getMatieres,
    getMatieresAvecPagination,
    getMatiereById,
    getMatieresByResponsable,
    getMatieresByResponsableAvecPagination,
    postMatiere,
    updateMatiere,
    deleteMatiere
};

