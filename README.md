# angularBackM2MBDSESATIC2024_2025-

Une application Web permettant aux utilisateurs de gerer leurs devoirs et d'y apporter quelques precisions tels qu'une note, des remarques, ...
Ce projet constitue la partie backend de l'app. Les données sont stockées dans une base MongoDB atlas.

<br>
Ces instructions fourniront une copie du projet utilisable en local pour du developpement ou du test( voir section deploiement plus bas pour la maniere de deployer le projet à distance)
<br>

### Conditions prealables

Il est necessaire d'avoir : 
- [Node.js](https://nodejs.org/en/) > v17
- npm(fourni avec Node.js)
- un compte [Mongo Atlas]

Installation de Node et npm : 
```bash
    sudo apt install nodejs npm
    node -v 
    npm -v 
```

<br>

### Installation 
##### cloner le depot 
```bash 
git clone https://github.com/votre-utilisateur/backend-assignments.git
cd backend-assignments
```

##### installer les dependances
```bash 
npm install
```

##### Créer un fichier .env à la racine du projet 
le fichier doit contenir : 
```bash 
MONGO_URI=mongodb+srv://lien_URI_obtenu_sur_mongoBD_Atlas
JWT_SECRET=votre_jwt_secret
```
##### Lancer le serveur localemnt
```bash 
node server.js
```
l'API est accessible par defaut sur ```http://localhost:8010/api/assignments```

<br>

### Deploiement 
Pour deployer sur Render.com :
- Connecter le repo GitHub 
- Build command = ```npm install```
- Start command = ```node server.js```
- Ajouter les variables d'environnement : 
    - MONGO_URI
    - JWT_SECRET

Apres lancement, Render vous retournera un Url de la forme ```https://assignment-backend.onrender.com```, l'API sera alors accessible via ```https://assignment-backend.onrender.com/api/assignments ```

<br>

### Construit avec
- Express.js - Framework serveur
- Mongoose - ODM pour MongoDB
- MongoDB Atlas - Base de Données 
- JWT - Authentification via token 
- Render - Deploiement cloud 

<br>

### Auteurs 
- [Alihou-junior](https://github.com/Alihou-junior)
- [capatainkomic](https://github.com/capatainkomic)

<br>

### Remerciements
- A l'equipe MBDS pour le sujet
- A mes collegues testeurs anonymes