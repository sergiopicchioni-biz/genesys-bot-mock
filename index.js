const express = require('express');
const app = express();

app.use(express.json());

app.post('/botconnector', (req, res) => {
 
  const body = req.body || {};
  const msg = body.inputMessage || {}; // Lavoriamo SOLO su inputMessage
  
  console.log('Chiamata BotConnector:', JSON.stringify(body, null, 2));
  // --- ESTRAZIONE DATI ---
  let userText = '';
  let userPayload = '';

  // Caso 1: Messaggio di Testo Semplice
  if (msg.type === 'Text') {
      userText = msg.text || '';
      // A volte il payload è nel testo se non c'è altro
  } 
  
  // Caso 2: Messaggio Strutturato (QuickReply, Postback, ButtonResponse)
  else if (msg.type === 'Structured') {
      const content = msg.content || [];
      
      // Cerchiamo un elemento che abbia una risposta pulsante (ButtonResponse)
      const buttonItem = content.find(c => c.contentType === 'ButtonResponse');
      
      if (buttonItem && buttonItem.buttonResponse) {
          // Estraggo testo e payload dal pulsante cliccato
          // Nota: Funziona sia per type="QuickReply" che per type="Button"
          userText = buttonItem.buttonResponse.text || ''; 
          userPayload = buttonItem.buttonResponse.payload || '';
      }
      // Se non trovo ButtonResponse, provo a cercare un generico 'payload' nel content
      else {
          const payloadItem = content.find(c => c.payload);
          if (payloadItem) {
              userPayload = payloadItem.payload;
              userText = payloadItem.text || '';
          }
      }
  }

  // Fallback estremo (se per qualche motivo i campi sono fuori standard)
  if (!userText && msg.text) userText = msg.text;
  if (!userPayload && msg.payload) userPayload = msg.payload;

  console.log(`[Input] Text: "${userText}" | Payload: "${userPayload}"`);

  // ... (Configurazione botState, intentName, ecc.) ...
  
  // Config
  let botState = 'MOREDATA';
  const uniqueId = new Date().getTime(); 
  let intentName = `Turn_${uniqueId}`; 
  let replyMessages = [];

  // --- LOGICA UNIFICATA (Catena if-else if) ---
  if (userPayload === 'THUMB_UP') {
      replyMessages.push({ type: 'Text', text: '*Grazie* per il feedback positivo! 😊' });

  } else if (userPayload === 'THUMB_DOWN') {
      replyMessages.push({ type: 'Text', text: 'Mi dispiace. Cercherò di migliorare.' });

  } else if (userPayload === 'CMD_YES') {
      replyMessages.push({ type: 'Text', text: 'Hai premuto SÌ (Payload ricevuto: *CMD_YES* )' });

  } else if (userPayload === 'CMD_NO') {
      replyMessages.push({ type: 'Text', text: '(Payload ricevuto: *CMD_NO*)' });

  } else if (/stop|esci/i.test(userText)) {
      botState = 'COMPLETE';
      intentName = 'handover';
      replyMessages.push({ type: 'Text', text: 'Chiusura bot.' });

  }  else if (/url/i.test(userText)) {
      replyMessages.push({
          type: 'Structured',
          text: 'Link Utili:', 
          content: [
              {
                  contentType: 'Card',
                  card: {
                      title: 'GC Card',
                      description: 'Clicca!',
                      actions: [
                          { type: 'Link', text: 'Apri Google', url: 'https://www.google.com' },
                          { type: 'Link', text: 'Apri Home', url: 'https://www.example.com' }
                      ]
                  }
              }
          ]
      });

  } else if (/quick/i.test(userText)) {
      // Quick Reply (Pollici Su/Giù)
      replyMessages.push({
          type: 'Structured',
          text: 'Vuoi continuare?', // Obbligatorio per Quick Reply
          content: [
              { 
                  contentType: 'QuickReply', 
                  quickReply: { 
                      text: 'SI 👍', // Testo visibile 
                      payload: 'CMD_YES', 
                      action: 'Message' 
                  } 
              },
              { 
                  contentType: 'QuickReply', 
                  quickReply: { 
                      text: 'NO 👎', 
                      payload: 'CMD_NO', 
                      action: 'Message' 
                  } 
              },
                         { 
                  contentType: 'QuickReply', 
                  quickReply: { 
                      text: 'Forse' , 
                      payload: 'Forse', 
                      action: 'Message' 
                  } 
              }           
          ]
      });

  } else if (/menu/i.test(userText)) {
      replyMessages.push({
          type: 'Structured',
          text: 'Menu *Comandi*',
          content: [
              { 
                  contentType: 'Card', 
                  card: {
                      title: 'Opzioni Avanzate',
                      description: 'Scegli una azione',
                      image: 'https://www.iamcp.it/wp-content/uploads/elementor/thumbs/asystel-bdf-logo-r4sb0gx88pw01x01dr5oderdte58k5kjss5erqmsjk.png',
                      defaultAction: { type: 'Link', url: 'https://www.asystel-bdf.it/' },
                      actions: [
                          { type: 'Link', text: 'DeepLink', url: 'myapp://product123' }, 
                          { type: 'Postback', text: 'Menu', payload: 'menu' },
                          { type: 'Postback', text: '*Start*', payload: 'GO' }
                      ]
                  }
              }
          ]
      });

  } else if (/carousel/i.test(userText)) {
      replyMessages.push({
          type: 'Structured',
          content: [{ 
            contentType: 'Carousel',
            carousel: {
                cards: [
                    {
                      title: 'Card #1',
                      description: 'Scegli',
                    image: 'https://www.iamcp.it/wp-content/uploads/elementor/thumbs/asystel-bdf-logo-r4sb0gx88pw01x01dr5oderdte58k5kjss5erqmsjk.png',
                     defaultAction: { type: 'Link', url: 'https://www.asystel-bdf.it/' },
                      actions: [
                          { type: 'Link', text: 'DeepLink', url: 'myapp://product123' },
                          { type: 'Postback', text: 'DeepLink', payload: '*' },
                          { type: 'Postback', text: 'start', payload: 'start' }
                      ]
                    },
                    {
                      title: 'Card #2',
                      description: 'Opzioni',
                      image: 'https://www.assintel.it/wp-content/uploads/avatars/1756/5c8a553e832d2-bpfull.png',
                      defaultAction: { type: 'Link', url: 'https://www.asystel-bdf.it/' }, 
                      actions: [
                          { type: 'Postback', text: 'url', payload: 'url' },
                          { type: 'Postback', text: 'misto', payload: 'misto' }
                      ]
                    }
                ]
            }
          }]
      });
  } else if (/misto/i.test(userText)) {
      // RISPOSTA MULTIPLA (Testo +  QuickReply)
      // 1. Messaggio di testo introduttivo
      replyMessages.push({ 
          type: 'Text', 
          text: 'Ecco una risposta mista: un testo, un testo con markdown e una domanda.' 
      });
      // 2. MArkdown
      replyMessages.push({ 
          type: 'Text', 
          text: `Questo è *grassetto* con un [link](https://example.com).
~~testo strike~~
_Testo italico_ e _*grassetto italico*_
Questo invece è  ==Evidenziato==  
Lista:
1. Primo elemento
2. Secondo elemento`
      });

      // 3. Quick Reply (Pollici Su/Giù)
      replyMessages.push({
          type: 'Structured',
          text: 'Ti è stato utile?', // Obbligatorio per Quick Reply
          content: [
              { 
                  contentType: 'QuickReply', 
                  quickReply: { 
                      text: '👍', // Testo visibile (Emoji)
                      payload: 'THUMB_UP', 
                      action: 'Message' 
                  } 
              },
              { 
                  contentType: 'QuickReply', 
                  quickReply: { 
                      text: '👎', 
                      payload: 'THUMB_DOWN', 
                      action: 'Message' 
                  } 
              }
          ]
      });
  } else {
      // Default
      replyMessages.push({
          type: 'Structured',
          text: 'Scegli un opzione:',
          content: [
              { contentType: 'QuickReply', quickReply: { text: 'menu', payload: 'menu', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'misto', payload: 'misto', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'url', payload: 'url', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'carousel', payload: 'carousel', action: 'Message' } },
             { contentType: 'QuickReply', quickReply: { text: 'quick', payload: 'quick', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'stop', payload: 'stop', action: 'Message' } }
          ]
      });
  }

  // Costruzione Risposta
  const response = {
    botState,
    intent: intentName,
    confidence: 1,
    replymessages: replyMessages,
    session: body.session || {
      botSessionId: 'BotConnector_sessionID',
      genesysConversationId: body.genesysConversationId || 'unknown'
    }
  };
  // ⭐ AGGIUNGI PARAMETRI PRIMA DI INVIARE LA RISPOSTA
  if (botState === 'COMPLETE' || intentName === 'handover') {
    response.parameters = {
      parameter1: 'value 1',
      exitReason: intentName,
      timestamp: new Date().toISOString()
    };
  }

  console.log('Risposta BotConnector:', JSON.stringify(response, null, 2));
  return res.json(response);  // ← SOLO QUI invii la risposta
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Bot mock su porta', PORT));
