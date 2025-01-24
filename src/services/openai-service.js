// src/services/openai-service.js
const INITIAL_DELAY = 2000;
const MAX_ATTEMPTS = 3;

const analyzeWithRetry = async (url, attempt = 1) => {
   try {
       const delay = INITIAL_DELAY * Math.pow(2, attempt - 1);
       await new Promise(r => setTimeout(r, delay));

       const response = await fetch('https://api.openai.com/v1/chat/completions', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
               'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`
           },
           body: JSON.stringify({
               model: "gpt-3.5-turbo",
               messages: [{
                   role: "system",
                   content: "Analiza el SEO brevemente"
               }, {
                   role: "user",
                   content: `Proporciona un análisis SEO conciso de: ${url}`
               }],
               temperature: 0.7,
               max_tokens: 150
           })
       });

       if (response.status === 429 && attempt < MAX_ATTEMPTS) {
           console.log(`Reintentando URL ${url}, intento ${attempt + 1}`);
           return analyzeWithRetry(url, attempt + 1);
       }

       const data = await response.json();
       return data.choices[0].message.content;
   } catch (error) {
       console.error(`Error en intento ${attempt}:`, error);
       throw new Error(`Error al analizar la URL (intento ${attempt})`);
   }
};

export const analyzeContent = async (urls) => {
   const results = [];
   for (const url of urls) {
       try {
           const analysis = await analyzeWithRetry(url);
           results.push({ url, analysis });
           await new Promise(r => setTimeout(r, 2000));
       } catch (error) {
           results.push({ 
               url, 
               error: error.message,
               retry: true 
           });
       }
   }
   return results;
};