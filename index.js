const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

// Debug: Afficher l'URI MongoDB
console.log('URI MongoDB:', process.env.MONGODB_URI);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques depuis le dossier public
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Middleware pour logger les requêtes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Import du modèle Product
const Product = require('./models/Product');

// Routes
const authRoutes = require('./routes/auth');
const orderRoutes = require('./routes/orders');

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);

// Fonction pour charger les données depuis le fichier JSON
async function loadProductsFromJson() {
  try {
    const jsonPath = path.join(__dirname, 'data', 'products.json');
    const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    
    // Transformer les données pour correspondre au schéma
    const products = jsonData.products.map(product => ({
      name: product.name,
      price: product.price,
      image: product.image,
      description: product.description,
      category: product.category,
      stock: product.stock
    }));

    return products;
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier JSON:', error);
    return [];
  }
}

// Configuration de la connexion MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connecté à MongoDB Atlas avec succès!');
    
    try {
      // Vérifier si des produits existent
      const count = await Product.countDocuments();
      console.log(`Nombre de produits dans la base de données: ${count}`);

      if (count === 0) {
        console.log('📦 Initialisation de la base de données avec les produits du fichier JSON...');
        
        const products = await loadProductsFromJson();
        if (products.length > 0) {
          await Product.insertMany(products);
          console.log(`✅ ${products.length} produits ajoutés avec succès`);
        } else {
          console.log('❌ Aucun produit trouvé dans le fichier JSON');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de l\'initialisation de la base de données:', error);
    }
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à MongoDB:', err);
    process.exit(1);
  });

// Routes
app.get('/api/products', async (req, res) => {
  try {
    console.log('Tentative de récupération des produits...');
    const products = await Product.find();
    console.log('Produits trouvés:', products);
    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/products/:id', async (req, res) => {
  try {
    console.log('Recherche du produit avec ID:', req.params.id);
    const product = await Product.findById(req.params.id);
    if (!product) {
      console.log('Produit non trouvé');
      return res.status(404).json({ message: "Produit non trouvé" });
    }
    console.log('Produit trouvé:', product);
    res.json(product);
  } catch (error) {
    console.error('Erreur lors de la récupération du produit:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

app.get('/api/products/category/:category', async (req, res) => {
  try {
    console.log('Recherche des produits de catégorie:', req.params.category);
    const products = await Product.find({ category: req.params.category });
    console.log('Produits trouvés:', products);
    res.json(products);
  } catch (error) {
    console.error('Erreur lors de la récupération des produits par catégorie:', error);
    res.status(500).json({ 
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Route pour ajouter un produit (pour les tests)
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur http://localhost:${PORT}`);
}); 