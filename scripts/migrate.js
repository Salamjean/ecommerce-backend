require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB Atlas'))
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err);
    process.exit(1);
  });

// Lire les données du fichier JSON
const productsData = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/products.json'), 'utf8'));

// Fonction pour migrer les données
async function migrateData() {
  try {
    // Supprimer toutes les données existantes
    await Product.deleteMany({});
    console.log('Données existantes supprimées');

    // Insérer les nouvelles données
    const products = await Product.insertMany(productsData.products);
    console.log(`${products.length} produits migrés avec succès`);

    // Fermer la connexion
    await mongoose.connection.close();
    console.log('Connexion à MongoDB fermée');
  } catch (error) {
    console.error('Erreur lors de la migration:', error);
    process.exit(1);
  }
}

// Exécuter la migration
migrateData(); 