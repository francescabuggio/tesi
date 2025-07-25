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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Received survey data:', JSON.stringify(req.body, null, 2));

    // Genera un session ID unico
    const sessionId = generateSessionId();
    
    // Prepara i dati da salvare
    const surveyData = {
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      ...req.body
    };

    console.log('Saving to Supabase:', sessionId);

    // Salva su Supabase
    const { data, error } = await supabase
      .from('responses')
      .insert([{ data: surveyData }])
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    console.log('Data saved successfully to Supabase:', data);

    res.status(200).json({ 
      success: true, 
      message: 'Dati salvati con successo su Supabase!',
      sessionId: sessionId,
      supabaseId: data[0]?.id
    });

  } catch (error) {
    console.error('Errore nel salvare i dati:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Errore nel salvare su Supabase'
    });
  }
}

function generateSessionId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
} 