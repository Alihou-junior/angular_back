let Matiere = require('../model/matiere');


// Récupérer toutes les matières SANS pagination
function getMatieres(req, res) {

    // Récupérer le terme de recherche depuis la query string, par ex. ?search=math
    const search = req.query.search;

    // Construction de la requête de recherche si un mot-clé est fourni
    const query = search
        ? { nom: { $regex: search, $options: 'i' } } // recherche insensible à la casse
        : {}; // sinon on récupère tout


    Matiere.find(query)
        .populate('responsable') // remplace l'ObjectId par les infos du user
        .exec((err, matieres) => {
            if (err) {
                return res.status(500).send({
                    message: 'Erreur lors de la récupération des matières', 
                    error: err
                });
            }
            res.status(200).json(matieres);
        });
}



// Récupérer les matieres AVEC pagination
function getMatieresAvecPagination(req, res) { 
    // On regarde si on a page=xxx et limit=yyy dans la query string
    // c'est-à-dire après le ? dans l'URL
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search;

    // requête de recherche avec paginate
    let aggregateQuery = Matiere.aggregate([
        // Filtre si on a une recherche (par nom)
        ...(search ? [{ $match: { nom: { $regex: search, $options: 'i' } } }] : []),

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


    // Application de la pagination avec aggregatePaginate
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
            }

            res.status(200).send(matieres);
        }
    );
}

// Récupérer une matière par son id (GET)
function getMatiereById(req, res) {

    //Récupérer l'id de la matiere
    let matiereId = req.params.id;

    // Chercher dans la base de données
    Matiere.findById(matiereId, (err, matiere) => {
        if (err) {
            res.status(500).send(err);
        }

        res.status(200).json(matiere);
    });
}



function getMatieresByResponsable(req, res) {

    // Récuperer l'id du user
    let responsableId = req.params.id;
    
    // Chercher dans la base de données
    Matiere.find({ responsable: responsableId }, (err, matieres) => {
        if (err) {
            res.send(err);
        }

        res.status(200).json(matieres);
    });
}


function getMatieresByResponsableAvecPagination(req, res) {

    // Récuperer l'id du user
    let responsableId = req.params.id;
    
    // page et limit en query string : ?page=1&limit=5
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    /* On crée une requête d'agrégation MongoDB sur le modèle Matiere */
    /* Le but ici est de filtrer les matières dont le responsable correspond à l'ID donné */
    const aggregate = Matiere.aggregate([

        // On garde uniquement les matières qui ont pour "responsable" l'ObjectId fourni
        { $match: { responsable: new mongoose.Types.ObjectId(responsableId) } }
    ]);

    // On exécute la requête d'agrégation avec pagination grâce au plugin mongoose-aggregate-paginate-v2
    Matiere.aggregatePaginate(aggregate, { page, limit })
        .then(result => res.status(200).json(result))
        .catch(err => res.status(500).send(err));

}




// Ajout d'une matière (POST)
function postMatiere(req, res) {

    // Creation de la matière 
    let matiere = new Matiere(); 
    matiere.nom = req.body.nom;
    matiere.description = req.body.description;
    matiere.responsable = req.user.id;
    
    // verifier qu'une image a été choisit sinon mettre image de defaut 
    if(req.body.image && req.body.image != "") {
        matiere.image = req.body.image;
    } else {
        matiere.image = 'https://i.pinimg.com/736x/82/75/ea/8275ea5e8c59e1f95401a6bd72566d41.jpg';
    }

    // Sauvegarde dans MongoDB
    matiere.save((err, newMatiere) => {
        if (err) {
            res.status(500).send('cant post subject ', err);
        }
        res.status(200).json(newMatiere);
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
            res.status(500).send(err);
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
            res.status(500).send(err);
        } else {
            res.status(200).send("suppression de la matiere : ");
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

