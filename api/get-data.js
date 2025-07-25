const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
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
    console.log('Fetching data from Supabase...');

    // Recupera tutti i dati da Supabase
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Data fetched from Supabase, entries:', data?.length || 0);

    // Estrai solo i dati del survey (campo 'data')
    const surveyData = data.map(row => row.data);

    // Calcola statistiche base
    const stats = {
      totalResponses: surveyData.length,
      lastUpdate: surveyData.length > 0 ? surveyData[0].timestamp : null,
      ageDistribution: calculateAgeDistribution(surveyData),
      genderDistribution: calculateGenderDistribution(surveyData),
      averageCompletionTime: calculateAverageTime(surveyData),
      educationDistribution: calculateEducationDistribution(surveyData),
      deviceDistribution: calculateDeviceDistribution(surveyData)
    };

    console.log('Statistics calculated:', stats);

    res.status(200).json({ 
      success: true, 
      data: surveyData,
      stats: stats,
      rawData: data // Include anche i dati raw con ID Supabase per debug
    });

  } catch (error) {
    console.error('Errore nel leggere i dati:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Errore nel leggere i dati da Supabase'
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

function calculateEducationDistribution(data) {
  const distribution = {};
  data.forEach(response => {
    if (response.initialSurvey && response.initialSurvey.education) {
      const education = response.initialSurvey.education;
      distribution[education] = (distribution[education] || 0) + 1;
    }
  });
  return distribution;
}

function calculateDeviceDistribution(data) {
  const distribution = {};
  data.forEach(response => {
    if (response.initialSurvey && response.initialSurvey.device) {
      const device = response.initialSurvey.device;
      distribution[device] = (distribution[device] || 0) + 1;
    }
  });
  return distribution;
}

function calculateAverageTime(data) {
  if (data.length === 0) return "Nessun dato";
  
  const times = data
    .filter(item => item.totalTimeSpent && item.totalTimeSpent > 0)
    .map(item => item.totalTimeSpent);
  
  if (times.length === 0) return "Nessun dato sul tempo";
  
  const avgMs = times.reduce((sum, time) => sum + time, 0) / times.length;
  const avgMinutes = Math.round(avgMs / 60000);
  
  return `${avgMinutes} minuti (media su ${times.length} risposte)`;
} 