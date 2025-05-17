require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Connexion à MongoDB avec options
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('✅ Connecté à MongoDB Atlas');
  return checkAndInitializeDB();
})
.catch(err => {
  console.error('❌ Erreur de connexion à MongoDB:', err);
  process.exit(1);
});

async function checkAndInitializeDB() {
  try {
    // Supprimer toutes les collections existantes pour repartir de zéro
    await mongoose.connection.dropDatabase();
    console.log('🗑️ Base de données réinitialisée');

    // Vérifier si des produits existent
    const count = await Product.countDocuments();
    console.log(`Nombre de produits dans la base de données: ${count}`);

    if (count === 0) {
      console.log('📦 Initialisation de la base de données avec des produits de test...');
      
      const testProducts = [
        {
          name: "T-shirt Premium",
          price: 29.99,
          image: "/images/tshirt.jpg",
          description: "T-shirt en coton bio de haute qualité, coupe régulière",
          category: "Vêtements",
          stock: 50
        },
        {
          name: "Jeans Slim Fit",
          price: 59.99,
          image: "/images/jeans.jpg",
          description: "Jeans slim fit stretch, confortable et élégant",
          category: "Vêtements",
          stock: 30
        },
        {
          name: "Casquette Logo",
          price: 19.99,
          image: "/images/casquette.jpg",
          description: "Casquette en coton avec logo brodé",
          category: "Accessoires",
          stock: 100
        },
        {
          name: "Sneakers Urban",
          price: 89.99,
          image: "/images/sneakers.jpg",
          description: "Sneakers confortables pour un style urbain",
          category: "Chaussures",
          stock: 25
        },
        {
          name: "Montre Classique",
          price: 149.99,
          image: "/images/montre.jpg",
          description: "Montre élégante avec bracelet en cuir",
          category: "Accessoires",
          stock: 15
        },
        {
          name: "Sac à dos",
          price: 45.99,
          image: "/images/sac.jpg",
          description: "Sac à dos robuste avec plusieurs compartiments",
          category: "Accessoires",
          stock: 40
        }
      ];

      await Product.insertMany(testProducts);
      console.log('✅ Produits de test ajoutés avec succès');
    }

    // Afficher tous les produits
    const products = await Product.find();
    console.log('\n📋 Produits dans la base de données:');
    console.log(JSON.stringify(products, null, 2));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    mongoose.connection.close();
    console.log('👋 Connexion à la base de données fermée');
  }
} 