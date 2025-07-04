# AssignmentApp - Backend

Une application Web permettant aux utilisateurs de gerer leurs devoirs et d'y apporter quelques precisions tels qu'une note, des remarques, ...
Ce projet constitue la partie backend de l'app. Les données sont stockées dans une base MongoDB atlas.

Ces instructions fourniront une copie du projet utilisable en local pour du developpement ou du test( voir section deploiement plus bas pour la maniere de deployer le projet à distance)
<br>



## Installation 
### Prérequis 
- [Node.js](https://nodejs.org/en/) > v17
- npm (fourni avec Node.js)
- un compte [Mongo Atlas](https://www.mongodb.com/fr-fr/products/platform/atlas-database)

### Installation de Node.js et npm : 
```bash
    sudo apt install nodejs npm
    node -v 
    npm -v 
```


### cloner le depot 
```bash 
git clone https://github.com/votre-utilisateur/backend-assignments.git
cd backend-assignments
```

### Installer les dependances
```bash 
npm install
```

### Créer un fichier .env à la racine du projet 
le fichier doit contenir : 
```bash 
MONGO_URI=mongodb+srv://lien_URI_obtenu_sur_mongoBD_Atlas
JWT_SECRET=votre_jwt_secret
CLOUDINARY_CLOUD_NAME=NOM_DE_VOTRE_CLOUD
CLOUDINARY_API_KEY=CLE_API_ASSOCIEE
CLOUDINARY_API_SECRET=CLE_API_SECRET_ASSOCIEE
```
> ### 📦 Configuration du Stockage d'Images
>
> ### Cloudinary - Hébergement des médias utilisateurs
>
> **Note importante** :  
> Les images uploadées par les utilisateurs sont normalement stockées sur Cloudinary.  
> Pour développer en local, vous devrez créer votre propre compte.
>
> #### 🛠 Étapes de configuration :
> 
> 1. **Inscription gratuite**  
>   Créez un compte sur [Cloudinary](https://cloudinary.com) (offre gratuite suffisante)
>
> 2. **Récupération des clés API**  
>    Dans votre espace Cloudinary :
>    - Cliquez sur ⚙ **Paramètres / Settings** (en bas à gauche)
>    - Allez dans l'onglet **API keys**
>    - Copiez ces 3 informations :
>     ```
>     Nom du cloud
>     Clé API
>     Secret API
>     ```
>     <img width="1906" height="823" alt="Image" src="https://github.com/user-attachments/assets/a77d3a41-d6ad-4542-88a0-18819058290d" />
>
> #### ℹ️ Pourquoi Cloudinary ?
> - **Gratuit** pour les petits projets (10GB de stockage inclus)
> - **Optimisation automatique** des images
> - **Sécurisé** avec liens signés
> - **Facile à intégrer** avec Angular/Node.js
>
> 💡 Le service reste gratuit tant que vous ne dépassez pas 10 000 images/mois.  
> Parfait pour notre usage pédagogique !
>

#### Lancer le serveur localemnt
```bash 
node server.js
```
l'API est accessible par defaut sur ```http://localhost:8010/api/assignments```

<br>

## Deploiement 
Pour deployer sur Render.com :
- Connecter le repo GitHub 
- Build command = ```npm install```
- Start command = ```node server.js```
- Ajouter les variables d'environnement : 
    - MONGO_URI
    - JWT_SECRET
    - CLOUDINARY_CLOUD_NAME
    - CLOUDINARY_API_KEY
    - CLOUDINARY_API_SECRET

Apres lancement, Render vous retournera un Url de la forme ```https://assignment-backend.onrender.com```, l'API sera alors accessible via ```https://assignment-backend.onrender.com/api/assignments ```

<br>

## Construit avec
- Express.js - Framework serveur
- Mongoose - ODM pour MongoDB
- MongoDB Atlas - Base de Données 
- JWT - Authentification via token 
- Render - Deploiement cloud
- Cloudinary - Stokage des images (et autres média) dans le cloud

<br>

## Auteur(s) et Autrice(s) 
- [Alihou-junior](https://github.com/Alihou-junior) - Développeur principal
- [capatainkomic](https://github.com/capatainkomic) - Développeuse collaboratrice

<br>
