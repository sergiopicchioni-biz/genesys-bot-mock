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
      replyMessages.push({ type: 'Text', text: '*Thank you*  😊' });

  } else if (userPayload === 'THUMB_DOWN') {
      replyMessages.push({ type: 'Text', text: 'Sorry.' });

  } else if (userPayload === 'CMD_YES') {
      replyMessages.push({ type: 'Text', text: ' (Payload: *CMD_YES* )' });

  } else if (userPayload === 'CMD_NO') {
      replyMessages.push({ type: 'Text', text: ' (Payload: *CMD_NO* )' });

  } else if (/stop|esci/i.test(userText)) {
      botState = 'COMPLETE';
      intentName = 'handover';
      replyMessages.push({ type: 'Text', text: 'Handover request. hold on.' });

  }  else if (/url/i.test(userText)) {
      replyMessages.push({
          type: 'Structured',
          text: 'Useful Links:', 
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
                      text: 'YES 👍', // Testo visibile 
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
                      text: 'Perhaps' , 
                      payload: 'Forse', 
                      action: 'Message' 
                  } 
              }           
          ]
      });

  } else if (/menu/i.test(userText)) {
      replyMessages.push({
          type: 'Structured',
          text: '*Card* text',
          content: [
              { 
                  contentType: 'Card', 
                  card: {
                      title: 'Options',
                      description: 'Choose one',
                      image: 'https://www.iamcp.it/wp-content/uploads/elementor/thumbs/asystel-bdf-logo-r4sb0gx88pw01x01dr5oderdte58k5kjss5erqmsjk.png',
                      defaultAction: { type: 'Link', url: 'https://www.asystel-bdf.it/' },
                      actions: [
                          { type: 'Link', text: 'DeepLink Simulation', url: 'myapp://product123' }, 
                          { type: 'Postback', text: 'Menu', payload: 'menu' },
                          { type: 'Postback', text: 'Start', payload: 'GO' }
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
                      description: '⭐ Choose',
                    image: 'https://www.iamcp.it/wp-content/uploads/elementor/thumbs/asystel-bdf-logo-r4sb0gx88pw01x01dr5oderdte58k5kjss5erqmsjk.png',
                     defaultAction: { type: 'Link', url: 'https://www.asystel-bdf.it/' },
                      actions: [
                          { type: 'Link', text: 'DeepLink (url)', url: 'myapp://product123' },
                          { type: 'Postback', text: 'DeepLink', payload: '*' },
                          { type: 'Postback', text: 'start', payload: 'start' }
                      ]
                    },
                    {
                      title: 'Card #2',
                      description: 'Options',
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
          text: 'Here is a mixed response: a complex text, a text with supported markdowns, and a quick reply.' 
      });
         replyMessages.push({ 
          type: 'Text', 
          text: `
TITLE*

Streamline visibility benchmark expansion stakeholder alignment. Prioritization vertical innovation capacity strategy paradigm. Touchpoint disruption margin visibility accountability proactive synergy, actionable touchpoint assets capacity optimization sustainability.

Ecosystem profit capability _integration framework_ actionable productivity integration. Empowerment funnel acquisition hierarchy effectiveness empowerment implementation pipeline ecosystem pipeline. Accountability proactive productivity integration strategy synergy synergy sustainability profit framework innovation horizontal.

You can [click her to see our offer](https://google.com)

Efficiency transformation acquisition benchmark stakeholder. Implementation paradigm capacity visibility pipeline standardization engagement growth structure paradigm actionable hierarchy competency monetization. Resources roadmap alignment stakeholder leverage optimize transformation capacity. Pipeline proactive vertical hierarchy transformation robust innovation, touchpoint facilitation horizontal profit strategy alignment. Matrix facilitation innovation flexibility initiative, profit profit horizontal agility.
`
      });
      // 2. Markdown
      replyMessages.push({ 
          type: 'Text', 
    text: `Ecco la formattazione markdown supportata in output:

This is *bold* text
This is _italics_ text
This is ~strikethrough~ text 
This is _*bold & italic*_ text
This is a hyperlink: [Google](https://google.com)
This is \`monospace\` text 

\`\`\`This is a 
code block
\`\`\`

This is ==highlighted== text 
`
      });

      // 3. Quick Reply (Pollici Su/Giù)
      replyMessages.push({
          type: 'Structured',
          text: 'Was it helpful to you?', // Obbligatorio per Quick Reply
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
   /*
         replyMessages.push({ 
          type: 'Text', 
          text: 'Ho ricevuto: ' + userText + ' ('+ userPayload +')'
      });*/
      replyMessages.push({
          type: 'Structured',
          text: 'Choose an *option*:',
          content: [
              { contentType: 'QuickReply', quickReply: { text: 'menu', payload: 'menu', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'misto', payload: 'misto', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'card with url', payload: 'url', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'carousel', payload: 'carousel', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'quick replay', payload: 'quick', action: 'Message' } },
              { contentType: 'QuickReply', quickReply: { text: 'stop bot', payload: 'stop', action: 'Message' } }
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
  //  AGGIUNGI PARAMETRI PRIMA DI INVIARE LA RISPOSTA
  if (botState === 'COMPLETE') {
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
