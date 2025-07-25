const supabase = require('@supabase/supabase-js');

// Credenziali Supabase hardcoded per test
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://zzytokqhoaqslwdsmijz.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6eXRva3Fob2Fxc2x3ZHNtaWp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0NTI5OTQsImV4cCI6MjA2OTAyODk5NH0.SqaQfe68M2iGebGYnSNZfjfWmfpXEEhVKJ1HWK2g6K0';

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
    console.log('Environment check for get-data:', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_KEY
    });

    // Crea client Supabase
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log('Fetching data from Supabase...');

    // Recupera tutti i dati da Supabase
    const result = await client
      .from('responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (result.error) {
      console.error('Supabase error:', result.error);
      throw new Error(`Supabase error: ${result.error.message}`);
    }

    const rawData = result.data || [];
    console.log('Data fetched from Supabase, entries:', rawData.length);

    // Estrai solo i dati del survey (campo 'data')
    const surveyData = rawData.map(function(row) {
      return row.data;
    });

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
      rawData: rawData // Include anche i dati raw con ID Supabase per debug
    });

  } catch (error) {
    console.error('Errore completo:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Errore nel leggere i dati da Supabase'
    });
  }
}

function calculateAgeDistribution(data) {
  const distribution = {};
  data.forEach(function(response) {
    if (response.initialSurvey && response.initialSurvey.age) {
      const age = response.initialSurvey.age;
      distribution[age] = (distribution[age] || 0) + 1;
    }
  });
  return distribution;
}

function calculateGenderDistribution(data) {
  const distribution = {};
  data.forEach(function(response) {
    if (response.initialSurvey && response.initialSurvey.gender) {
      const gender = response.initialSurvey.gender;
      distribution[gender] = (distribution[gender] || 0) + 1;
    }
  });
  return distribution;
}

function calculateEducationDistribution(data) {
  const distribution = {};
  data.forEach(function(response) {
    if (response.initialSurvey && response.initialSurvey.education) {
      const education = response.initialSurvey.education;
      distribution[education] = (distribution[education] || 0) + 1;
    }
  });
  return distribution;
}

function calculateDeviceDistribution(data) {
  const distribution = {};
  data.forEach(function(response) {
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
    .filter(function(item) { return item.totalTimeSpent && item.totalTimeSpent > 0; })
    .map(function(item) { return item.totalTimeSpent; });
  
  if (times.length === 0) return "Nessun dato sul tempo";
  
  const avgMs = times.reduce(function(sum, time) { return sum + time; }, 0) / times.length;
  const avgMinutes = Math.round(avgMs / 60000);
  
  return `${avgMinutes} minuti (media su ${times.length} risposte)`;
} 