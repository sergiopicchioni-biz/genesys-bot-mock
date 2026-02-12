const express = require('express');
const app = express();

app.use(express.json());

app.post('/botconnector', (req, res) => {
  const body = req.body || {};
  console.log('Richiesta BotConnector:', JSON.stringify(body, null, 2));

  const input = body.input || {};
  const userText = input.text || '';

  let botText = 'Ciao, sono il bot mock su Render.';
  let intentName = 'handover';   // esiste nella botlist
  let isFinal = false;

  if (/ciao|buongiorno/i.test(userText)) {
    botText = 'Ciao! Come posso aiutarti oggi?';
    intentName = 'smalltalk';
  } else if (/operatore|agente|handover/i.test(userText)) {
    botText = 'Ti passo a un operatore umano.';
    intentName = 'handover';
    isFinal = true;
  }

  const response = {
    // stato della sessione bot lato Genesys
    botState: isFinal ? 'ENDED' : 'IN_PROGRESS',
    // intent riconosciuto per questo turno
    intent: {
      name: intentName,
      confidence: 1.0
    },
    // messaggi che il bot manda al cliente
    replyMessages: [
      {
        type: 'Text',
        text: botText
      }
    ],
    // opzionale: variabili di sessione
    session: body.session || {}
  };

  console.log('Risposta BotConnector:', JSON.stringify(response, null, 2));
  return res.json(response);
});


app.get('/', (req, res) => {
  res.send('Genesys Bot Mock è vivo');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot mock su porta', PORT));
