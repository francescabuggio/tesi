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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Environment check:', {
      hasUrl: !!SUPABASE_URL,
      hasKey: !!SUPABASE_KEY,
      url: SUPABASE_URL?.substring(0, 30) + '...'
    });

    // Crea client Supabase
    const client = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    console.log('Received survey data keys:', Object.keys(req.body));

    // Genera un session ID unico
    const sessionId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    // Prepara i dati da salvare
    const surveyData = {
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      ...req.body
    };

    console.log('Saving to Supabase with sessionId:', sessionId);

    // Salva su Supabase
    const result = await client
      .from('responses')
      .insert([{ data: surveyData }])
      .select();

    if (result.error) {
      console.error('Supabase error:', result.error);
      throw new Error(`Supabase error: ${result.error.message}`);
    }

    console.log('Data saved successfully to Supabase:', result.data?.length);

    res.status(200).json({ 
      success: true, 
      message: 'Dati salvati con successo su Supabase!',
      sessionId: sessionId,
      supabaseId: result.data?.[0]?.id
    });

  } catch (error) {
    console.error('Errore completo:', error.message, error.stack);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      details: 'Errore nel salvare su Supabase'
    });
  }
} 