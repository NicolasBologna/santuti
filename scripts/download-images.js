const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Lista de IDs de productos
const productIds = [
  'AV000029',
  'MASAJ301',
  'INFLAGLO13',
  'PARLN019',
  'AV000212',
  'CWIR0001',
  'CAFETE02',
  'CAFETE10',
  'MOLIN031',
  'P2P00047',
  'P2P00053',
  'KPARRI03'
];

const outputDir = path.join(__dirname, '../src/assets/product-images');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

const downloadImage = async (id) => {
  const url = `https://images.bidcom.com.ar/resize?src=https://static.bidcom.com.ar/publicacionesML/productos/${id}/1000x1000-${id}.jpg&w=500&q=100`;
  const filePath = path.join(outputDir, `${id}.jpg`);

  try {
    const response = await axios.get(url, { responseType: 'stream' });
    const writer = fs.createWriteStream(filePath);

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ ${id}.jpg descargado`);
        resolve();
      });
      writer.on('error', reject);
    });
  } catch (error) {
    console.error(`❌ Error al descargar ${id}: ${error.message}`);
  }
};

const run = async () => {
  console.log('📦 Descargando imágenes...');
  for (const id of productIds) {
    await downloadImage(id);
  }
  console.log('🏁 Descarga finalizada.');
};

run();
