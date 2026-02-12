const express = require('express');
const app = express();

app.use(express.json());

app.post('/botconnector', (req, res) => {
  console.log('Richiesta BotConnector:', JSON.stringify(req.body, null, 2));

  const response = {
    session: {
      id: req.body?.session?.id || 'demo-session-123',
      state: 'inProgress'
    },
    output: {
      messages: [
        {
          type: 'Text',
          text: 'Ciao! Sono un bot di demo collegato via Bot Connector.'
        },
        {
          type: 'Text',
          text: 'Per questa PoC rispondo sempre con messaggi hardcoded.'
        }
      ]
    }
  };

  res.json(response);
});

app.get('/', (req, res) => {
  res.send('Genesys Bot Mock è vivo');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot mock su porta', PORT));
