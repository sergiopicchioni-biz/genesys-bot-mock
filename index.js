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

  // Configurazione di base
  let botState = 'MOREDATA';
  // Genera un suffisso univoco ogni volta
  const uniqueId = new Date().getTime(); 
  let intentName = `Info_${uniqueId}`; // Es: Info_1739401234567
  let replyMessages = [];

  // Logica dei casi richiesti
  if (/testo/i.test(userText)) {
    // 1. Testo semplice
    replyMessages.push({
      type: 'Text',
      text: 'Questo è un messaggio di testo semplice.'
    });

  } else if (/array/i.test(userText)) {
    // 2. Array di testi (due messaggi separati)
    replyMessages.push(
      { type: 'Text', text: 'Primo messaggio.' },
      { type: 'Text', text: 'Secondo messaggio.' }
    );

  } else if (/url markdown/i.test(userText)) {
    // 4. URL come markdown (se il canale lo supporta nel testo)
    replyMessages.push({
      type: 'Text',
      text: 'Ecco il link formattato: [Google](https://www.google.com)'
    });

  } else if (/url/i.test(userText)) {
    // 3. URL strutturato (Link Button in una Card
    replyMessages.push({
      type: 'Structured',
      content: [
        {
          contentType: 'Card',
          card: {
            title: 'Link Esterno',
            description: 'Clicca per aprire',
            actions: [
              {
                type: 'Link',
                text: 'Apri Google', // label pulsante
                url: 'https://www.google.com'
              }
            ]
          }
        }
      ]
    });

   } else if (/quick/i.test(userText)) {
    replyMessages.push({
      type: 'Structured', 
      text: 'Scegli un opzione:', // <--- QUESTO CAMPO È OBBLIGATORIO PER LE QUICK REPLY
      content: [
        {
          contentType: 'QuickReply',
          quickReply: {
            text: 'Sì',
            payload: 'YES',
            action: 'Message'
          }
        },
        {
          contentType: 'QuickReply',
          quickReply: {
            text: 'No',
            payload: 'NO',
            action: 'Message'
          }
        }
      ]
    });

  } else if (/stop/i.test(userText)) {
    // Caso uscita
    replyMessages.push({ type: 'Text', text: 'Chiusura bot.' });
    botState = 'COMPLETE';
    intentName = 'handover';

  } else {
    // Default fallback
    replyMessages.push({
      type: 'Text',
      text: 'Comandi: "testo", "array", "url", "url markdown", "quick", "stop".'
    });
  }

  const response = {
    botState,
    intent: intentName,
    confidence: 1,
    replymessages: replyMessages, // array di oggetti (Text o Structured)
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
