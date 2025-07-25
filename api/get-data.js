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

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'surveys.json');
    
    console.log('Checking file at:', filePath);
    console.log('File exists:', fs.existsSync(filePath));
    
    if (!fs.existsSync(filePath)) {
      console.log('File not found, returning empty data');
      return res.status(200).json({ 
        success: true, 
        data: [],
        stats: {
          totalResponses: 0,
          lastUpdate: null,
          ageDistribution: {},
          genderDistribution: {},
          averageCompletionTime: "Nessun dato"
        }
      });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = fileContent ? JSON.parse(fileContent) : [];

    console.log('Data loaded, entries:', data.length);

    // Calcola statistiche base
    const stats = {
      totalResponses: data.length,
      lastUpdate: data.length > 0 ? data[data.length - 1].timestamp : null,
      ageDistribution: calculateAgeDistribution(data),
      genderDistribution: calculateGenderDistribution(data),
      averageCompletionTime: calculateAverageTime(data)
    };

    res.status(200).json({ 
      success: true, 
      data: data,
      stats: stats
    });

  } catch (error) {
    console.error('Errore nel leggere i dati:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Errore nel leggere i dati'
    });
  }
}

function calculateAgeDistribution(data) {
  const distribution = {};
  data.forEach(response => {
    if (response.initialSurvey && response.initialSurvey.age) {
      const age = response.initialSurvey.age;
      distribution[age] = (distribution[age] || 0) + 1;
    }
  });
  return distribution;
}

function calculateGenderDistribution(data) {
  const distribution = {};
  data.forEach(response => {
    if (response.initialSurvey && response.initialSurvey.gender) {
      const gender = response.initialSurvey.gender;
      distribution[gender] = (distribution[gender] || 0) + 1;
    }
  });
  return distribution;
}

function calculateAverageTime(data) {
  if (data.length === 0) return "Nessun dato";
  
  const times = data
    .filter(item => item.totalTimeSpent)
    .map(item => item.totalTimeSpent);
  
  if (times.length === 0) return "Nessun dato";
  
  const avgMs = times.reduce((sum, time) => sum + time, 0) / times.length;
  const avgMinutes = Math.round(avgMs / 60000);
  
  return `${avgMinutes} minuti`;
} 