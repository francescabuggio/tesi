# Survey SportPlanet - Ricerca VU Amsterdam

Sito di ricerca che combina survey + ecommerce mockup per studiare comportamenti di acquisto online.

## 🚀 Deploy su Vercel

### 1. Setup Repository
```bash
# Clona o crea repository GitHub
git init
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Deploy Vercel
1. Vai su [vercel.com](https://vercel.com)
2. Importa il repository GitHub
3. Vercel rileverà automaticamente la configurazione
4. Deploy automatico!

### 3. URLs
- **Sito principale**: `https://your-project.vercel.app`
- **Dashboard admin**: `https://your-project.vercel.app/admin`

## 📊 Funzionalità

### Frontend
- **Survey iniziale**: Dati demografici + scala Likert
- **Scenario**: Contesto buono regalo SportPlanet
- **Ecommerce**: 4 magliette, checkout con opzioni eco
- **Survey finale**: Valutazione esperienza + responsabilità ambientale

### Backend APIs
- `POST /api/save-survey` - Salva dati completi
- `GET /api/get-data` - Recupera tutti i dati per admin

### Dashboard Admin
- **Statistiche**: Totale risposte, distribuzioni età/genere
- **Grafici**: Chart.js per visualizzazioni
- **Esportazione**: Download CSV dei dati
- **Aggiornamento**: Real-time ogni 30 secondi

## 📁 Struttura Dati

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "sessionId": "abc123",
  "initialSurvey": {
    "age": "25-34",
    "gender": "female",
    "education": "bachelor",
    // ... altre risposte
  },
  "checkoutData": {
    "product": {...},
    "variant": 2,
    "checkoutStartedAt": "..."
  },
  "orderData": {
    "firstName": "Mario",
    "deliveryMethod": "Click & Collect",
    // ... dati ordine
  },
  "finalSurvey": {
    "environmental_consideration": "often",
    // ... scale Likert
  },
  "totalTimeSpent": 180000,
  "completedAt": "2024-01-15T10:33:00Z"
}
```

## 🔧 Sviluppo Locale

```bash
# Installa Vercel CLI
npm i -g vercel

# Avvia sviluppo locale
vercel dev
```

## 📈 Analisi Dati

I dati vengono salvati in `/data/surveys.json` e sono accessibili via:
- Dashboard web `/admin`
- Download CSV
- API diretta `/api/get-data`

## 🎯 Varianti Checkout

Il sistema mostra casualmente una di 4 varianti di checkout:
1. **Base**: Solo opzioni di consegna
2. **Eco label**: "Scelta ecologica"
3. **Risparmio CO₂**: Percentuali specifiche
4. **Analisi completa**: Calcoli dettagliati emissioni

## 🔒 Note Sicurezza

- Nessun dato personale sensibile
- Session ID anonimi
- CORS configurato per sicurezza
- Backup automatico Vercel 