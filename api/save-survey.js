const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received survey data:', JSON.stringify(req.body, null, 2));

    const surveyData = {
      timestamp: new Date().toISOString(),
      sessionId: generateSessionId(),
      ...req.body
    };

    // Path per il file JSON
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'surveys.json');

    console.log('Data directory:', dataDir);
    console.log('File path:', filePath);

    // Crea directory se non esiste
    if (!fs.existsSync(dataDir)) {
      console.log('Creating data directory...');
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Leggi dati esistenti o crea array vuoto
    let existingData = [];
    if (fs.existsSync(filePath)) {
      console.log('Reading existing data...');
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      existingData = fileContent ? JSON.parse(fileContent) : [];
    } else {
      console.log('No existing data file found, creating new...');
    }

    // Aggiungi nuovi dati
    existingData.push(surveyData);
    console.log('Total entries after adding:', existingData.length);

    // Salva file aggiornato
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    console.log('Data saved successfully');

    res.status(200).json({ 
      success: true, 
      message: 'Dati salvati con successo',
      sessionId: surveyData.sessionId,
      totalEntries: existingData.length
    });

  } catch (error) {
    console.error('Errore nel salvare i dati:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Errore interno del server'
    });
  }
}

function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
} 