let Assignment = require('../model/assignment');

// Récupérer tous les assignments (GET)
function getAssignments(req, res){
    // On regarde si on a name=xxx après le ?
    // ce qui suit le ? s'appelle la query string
    const name = req.query.name;
    const rendu = req.query.rendu;

    let requete = {};
    if(name !== undefined){
        requete.nom = { $regex: name, $options: 'i' };
    }
    if(rendu !== undefined){
        requete.rendu = rendu;
    }

        // requête de recherche par le nom
        Assignment.find(requete, (err, assignments) => {
            if(err){
                res.send(err)
            }
    
            res.send(assignments);
        });
    
}

function getAssignmentsAvecPagination(req, res){
    // On regarde si on a page=xxx et limit=yyy dans la query string
    // c'est-à-dire après le ? dans l'URL
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    // requête de recherche avec pagination
    let aggregateQuery = Assignment.aggregate();

    Assignment.aggregatePaginate(
        aggregateQuery, 
        { 
            page: page, 
            limit: limit,

        }, (err, assignments) => {
            if(err){
                res.send(err)
            }
    
            res.send(assignments);
        });

}

// Récupérer un assignment par son id (GET)
function getAssignment(req, res){
    let assignmentId = req.params.id;
    console.log(assignmentId);
    console.log("type de assignmentId : " + typeof assignmentId);

    // si on cherche un objet par une ou plusieurs propriétés autres que _id qui
    // est la clé primaire de l'objet, on peut utiliser la méthode find ou findOne
    // exemple :
    // Assignment.find({name: "Nouveau DEVOIR", rendu:false}, (err, assignment) => {
    //     if(err){res.send(err)}
    //     res.json(assignment);
    // })

    // on va plutôt faire un findById avec l'id mongoDB
    Assignment.findById(assignmentId, (err, assignment) =>{
        if(err){res.send(err)}
        res.json(assignment);
    })
}

// Ajout d'un assignment (POST)
function postAssignment(req, res){
    let assignment = new Assignment();
    assignment.nom = req.body.nom;
    assignment.dateDeRendu = req.body.dateDeRendu;
    assignment.rendu = req.body.rendu;
    assignment.auteur = req.body.auteur;
    //assignment.matiere = req.body.matiere;
    assignment.remarques = req.body.remarques;
    assignment.note = req.body.note;
    assignment.matiere = {
        nom: req.body.matiere.nom,
        image: req.body.matiere.image,
        imageProf: req.body.matiere.imageProf !== '' ? req.body.matiere.imageProf : 'https://i.pinimg.com/736x/65/22/af/6522aff04c2e8d330fe32de8a234e828.jpg' // URL de l'image par défaut
    };

    console.log("POST assignment reçu :");
    console.log(assignment)

    assignment.save( (err) => {
        if(err){
            res.send('cant post assignment ', err);
        }
        res.json(assignment.id)
    })
}

// Update d'un assignment (PUT)
function updateAssignment(req, res) {
    console.log("UPDATE recu assignment : ");
    console.log(req.body);

    const updateData = {
        nom: req.body.nom,
        dateDeRendu: req.body.dateDeRendu,
        rendu: req.body.rendu,
        auteur: req.body.auteur,
        matiere: {
            nom: req.body.matiere.nom,
            image: req.body.matiere.image,
            imageProf: req.body.matiere.imageProf
        },
        remarques: req.body.remarques,
        note: req.body.note
    };

    Assignment.findByIdAndUpdate(req.body._id, updateData, {new: true}, (err, assignment) => {
        if (err) {
            console.log(err);
            res.send(err)
        } else {
          res.json("Assignment id=" + req.body._id + " updated");
        }

      // console.log('updated ', assignment)
    });

}

// suppression d'un assignment (DELETE)
function deleteAssignment(req, res) {

    Assignment.findByIdAndRemove(req.params.id, (err, assignment) => {
        if (err) {
            res.send(err);
        }
        res.json(assignment.nom + " deleted");
    })
}



module.exports = { getAssignmentsAvecPagination, postAssignment, getAssignment, updateAssignment, deleteAssignment };
