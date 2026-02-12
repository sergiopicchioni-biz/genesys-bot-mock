const express = require('express');
const app = express();

app.use(express.json());

app.post('/botconnector', (req, res) => {
  const body = req.body || {};
  console.log('Richiesta BotConnector:', JSON.stringify(body, null, 2));

  const userText = body?.input?.text || '';

  let botText = 'Ciao, sono il bot mock su Render.';
  let intentName = 'Success';   // intent generico
  let botState = 'MOREDATA';    // continua conversazione

  if (/ciao|buongiorno|hello/i.test(userText)) {
    botText = 'Ciao! Come posso aiutarti oggi?';
    intentName = 'handover';
    botState = 'MOREDATA';
  } else if (/operatore|agente|handover|help/i.test(userText)) {
    botText = 'Certo che ti aiuto.';
    intentName = 'handover';   // deve esistere nella botlist
    botState = 'COMPLETE';     // esce dal bot
  } else if (/fine|stop|termina|chiudi/i.test(userText)) {
    botText = 'Ok, chiudo la conversazione. A presto!';
    intentName = 'handover';
    botState = 'COMPLETE';     // chiude senza handover
  } else if (userText) {
    botText = `Hai scritto: "${userText}". Dimmi "operatore" per parlare con un agente.`;
    intentName = 'handover';
    botState = 'MOREDATA';
  }

  const response = {
    botState: botState,
    intent: intentName,
    confidence: 1,
    replymessages: [
      {
        type: 'Text',
        text: botText
      }
    ],
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
