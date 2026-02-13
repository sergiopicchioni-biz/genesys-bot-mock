const express = require('express');
const app = express();

app.use(express.json());

app.post('/botconnector', (req, res) => {
  const body = req.body || {};
  console.log('Richiesta BotConnector:', JSON.stringify(body, null, 2));

   // 1. Recupero Input: Potrebbe essere testo O payload (se postback)
  let userText = body.input?.text || '';
  let userPayload = body.input?.payload || ''; // <--- CATTURIAMO IL PAYLOAD

  console.log(`[Input] Text: "${userText}" | Payload: "${userPayload}"`);
  
  // Configurazione di base
  let botState = 'MOREDATA';
  // Genera un suffisso univoco ogni volta
  const uniqueId = new Date().getTime(); 
  let intentName = `Turn_${uniqueId}`; // Es: Info_1739401234567
  let replyMessages = [];

    if (userPayload === 'CMD_YES' || userText === 'CMD_YES') {
      replyMessages.push({ type: 'Text', text: 'Hai premuto SÌ (Ho ricevuto il payload nascosto CMD_YES)' });
  }
  else if (userPayload === 'CMD_NO' || userText === 'CMD_NO') {
      replyMessages.push({ type: 'Text', text: 'Hai premuto NO (Ho ricevuto il payload nascosto CMD_NO)' });
  }

  // Logica dei casi richiesti
if (/stop|esci/i.test(userText)) {
      botState = 'COMPLETE';
      intentName = 'Handover';
      replyMessages.push({ type: 'Text', text: 'Chiusura bot.' });

  } else if (/quick/i.test(userText)) {
      replyMessages.push({
          type: 'Structured',
          text: 'Scegli un opzione:',
          content: [
              { contentType: 'QuickReply', quickReply: { text: 'Sì', payload: 'YES', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'No', payload: 'NO', action: 'Message' } }
          ]
      });

  } else if (/url markdown/i.test(userText)) {
      replyMessages.push({ type: 'Text', text: 'Ecco il link formattato: [Google](https://www.google.com)' });

  } else if (/url/i.test(userText)) {
      replyMessages.push({
          type: 'Structured',
          text: 'Link Utili:', // Sempre meglio mettere un testo anche qui
          content: [
              {
                  contentType: 'Card',
                  card: {
                      title: 'Link Esterno',
                      description: 'Clicca per aprire',
                      actions: [
                          { type: 'Link', text: 'Apri Google', url: 'https://www.google.com' },
                          { type: 'Link', text: 'Apri Home', url: 'https://www.example.com' } // <--- CORRETTO (era Link 2)
                      ]
                  }
              }
          ]
      });

  } else if (/menu/i.test(userText)) {
      replyMessages.push({
          type: 'Structured',
          text: 'Menu Comandi:',
          content: [
              { 
                  contentType: 'Card', 
                  card: {
                      title: 'Opzioni Avanzate',
                      description: 'Scegli un comando',
                      actions: [
                          { type: 'Postback', text: 'Conferma', payload: 'CMD_YES' },
                          { type: 'Postback', text: 'Annulla', payload: 'CMD_NO' }
                      ]
                  }
              }
          ]
      });

  } else {
      // Default
      replyMessages.push({
          type: 'Text',
          text: 'Comandi: "testo", "array", "url", "url markdown", "quick", "menu", "stop".'
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
