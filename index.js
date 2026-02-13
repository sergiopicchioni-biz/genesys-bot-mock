const express = require('express');
const app = express();

app.use(express.json());

app.post('/botconnector', (req, res) => {
  const body = req.body || {};
  console.log('Richiesta BotConnector:', JSON.stringify(body, null, 2));

  // Input
  let userText = body.input?.text || '';
  let userPayload = body.input?.payload || ''; 

  console.log(`[Input] Text: "${userText}" | Payload: "${userPayload}"`);
  
  // Config
  let botState = 'MOREDATA';
  const uniqueId = new Date().getTime(); 
  let intentName = `Turn_${uniqueId}`; 
  let replyMessages = [];

  // --- LOGICA UNIFICATA (Catena if-else if) ---

  if (userPayload === 'CMD_YES' || userText === 'CMD_YES') {
      replyMessages.push({ type: 'Text', text: 'Hai premuto SÌ (Payload ricevuto: CMD_YES)' });

  } else if (userPayload === 'CMD_NO' || userText === 'CMD_NO') {
      replyMessages.push({ type: 'Text', text: 'Hai premuto NO (Payload ricevuto: CMD_NO)' });

  } else if (/stop|esci/i.test(userText)) {
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
          text: 'Link Utili:', 
          content: [
              {
                  contentType: 'Card',
                  card: {
                      title: 'Link Esterno',
                      description: 'Clicca per aprire',
                      actions: [
                          { type: 'Link', text: 'Apri Google', url: 'https://www.google.com' },
                          { type: 'Link', text: 'Apri Home', url: 'https://www.example.com' }
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

  // Costruzione Risposta
  const response = {
    botState,
    intent: intentName,
    confidence: 1,
    replymessages: replyMessages,
    // Meglio usare body.session direttamente se possibile, altrimenti assicurati che body.botSessionId esista!
    session: body.session || {
      botSessionId: body.botSessionId || 'unknown',
      genesysConversationId: body.genesysConversationId || 'unknown',
      languageCode: body.languageCode || 'it-it'
    }
  };

  console.log('Risposta BotConnector:', JSON.stringify(response, null, 2));
  return res.json(response);
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot mock su porta', PORT));
