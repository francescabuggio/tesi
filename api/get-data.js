const fs = require('fs');
const path = require('path');

module.exports = function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const filePath = path.join(process.cwd(), 'data', 'surveys.json');
    
    if (!fs.existsSync(filePath)) {
      return res.status(200).json({ 
        success: true, 
        data: [],
        stats: {
          totalResponses: 0,
          lastUpdate: null
        }
      });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const data = fileContent ? JSON.parse(fileContent) : [];

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
      error: 'Errore nel leggere i dati' 
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
  // Placeholder - potresti aggiungere tracking del tempo
  return "Non ancora implementato";
} 