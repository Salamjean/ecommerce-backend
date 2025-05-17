const path = require('path');
const fs = require('fs');

// Vérifier si le fichier .env existe
const envPath = path.join(__dirname, '.env');
console.log('Chemin du fichier .env:', envPath);
console.log('Le fichier .env existe:', fs.existsSync(envPath));

// Essayer de lire le fichier .env
try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  console.log('\nContenu du fichier .env:');
  console.log(envContent);
} catch (error) {
  console.error('Erreur lors de la lecture du fichier .env:', error.message);
}

// Vérifier les variables d'environnement
console.log('\nVariables d\'environnement:');
console.log('MONGODB_URI:', process.env.MONGODB_URI); 