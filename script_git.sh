#!/bin/bash
echo "Avez-vous fait un git pull ?"
read -p "Entrez 'o' pour oui  ou 'n' pour non  " reponse 
read -p "Entrez le message du commit " message
if [ "$reponse" == "n" ]; then
	git pull
	git add *
	git commit -m "$message"
	git push origin main
elif [ "$reponse" == "o" ]; then 
	git add *
	git commit -m "$message"
	git push origin main 
else
    echo "Réponse invalide. Veuillez entrer 'oui' ou 'non'."
fi
