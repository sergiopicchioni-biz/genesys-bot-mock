const express = require('express');
const app = express();

app.use(express.json());

app.post('/botconnector', (req, res) => {
  const body = req.body || {};
  console.log('Richiesta BotConnector:', JSON.stringify(body, null, 2));

  const input = body.input || {};
  const userText = input.text || '';

  // Logica banale di risposta
  let botText = 'Ciao, sono il bot mock su Render.';
  if (/ciao|buongiorno/i.test(userText)) {
    botText = 'Ciao! Come posso aiutarti oggi?';
  } else if (/fine|stop|termina/i.test(userText)) {
    botText = 'Ok, chiudo la conversazione. A presto!';
  }

  const response = {
    session: {
      id: (body.session && body.session.id) || 'demo-session-XXX',
      state: /fine|stop|termina/i.test(userText) ? 'ended' : 'inProgress'
    },
  output: {
    intent: {
      name: 'handover',   // deve esistere nella botlist
      confidence: 1.0
    },
    messages: [
      {
        type: 'Text',
        text: botText
      }
    ]
  }
};
 console.log('Risposta BotConnector:', JSON.stringify(response, null, 2));
  return res.json(response);
});


app.get('/', (req, res) => {
  res.send('Genesys Bot Mock è vivo');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot mock su porta', PORT));
