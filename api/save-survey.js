const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const surveyData = {
      timestamp: new Date().toISOString(),
      sessionId: generateSessionId(),
      ...req.body
    };

    // Path per il file JSON
    const dataDir = path.join(process.cwd(), 'data');
    const filePath = path.join(dataDir, 'surveys.json');

    // Crea directory se non esiste
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Leggi dati esistenti o crea array vuoto
    let existingData = [];
    if (fs.existsSync(filePath)) {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      existingData = fileContent ? JSON.parse(fileContent) : [];
    }

    // Aggiungi nuovi dati
    existingData.push(surveyData);

    // Salva file aggiornato
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    res.status(200).json({ 
      success: true, 
      message: 'Dati salvati con successo',
      sessionId: surveyData.sessionId
    });

  } catch (error) {
    console.error('Errore nel salvare i dati:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Errore interno del server' 
    });
  }
}

function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
} 