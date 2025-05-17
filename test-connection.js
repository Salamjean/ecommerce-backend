require('dotenv').config();
const mongoose = require('mongoose');

console.log('URI MongoDB:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connecté à MongoDB Atlas avec succès!');
    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à MongoDB:', err.message);
  }); 