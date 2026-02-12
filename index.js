const express = require('express');
const app = express();

app.use(express.json());

app.post('/botconnector', (req, res) => {
  const body = req.body || {};
  console.log('Richiesta BotConnector:', JSON.stringify(body, null, 2));

  const userText =
    body?.input?.text ??
    body?.inputMessage?.text ??
    '';

  let botText = 'Scrivi "ciao" per iniziare o "stop" per uscire.';
  let intentName = 'handover';
  let botState = 'MOREDATA';

  if (/ciao/i.test(userText)) {
    botText = 'Ciao! Sono il bot di demo. Scrivi "stop" quando hai finito.';
    intentName = 'handover';
    botState = 'MOREDATA';
  } else if (/stop/i.test(userText)) {
    botText = 'Ok, chiudo e ti passo a un operatore. A presto!';
    intentName = 'handover';
    botState = 'COMPLETE';
  } else if (userText) {
    botText = `Hai scritto: "${userText}". Rispondi con "stop" per uscire.`;
    intentName = 'handover';
    botState = 'MOREDATA';
  }

  const response = {
    botState,
    intent: intentName,
    confidence: 1,
    replymessages: [
      { type: 'Text', text: botText }
    ],
    session: {
      botSessionId: body.botSessionId || null,
      genesysConversationId: body.genesysConversationId || null,
      languageCode: body.languageCode || null
    }
  };

  console.log('Risposta BotConnector:', JSON.stringify(response, null, 2));
  return res.json(response);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot mock su porta', PORT));
