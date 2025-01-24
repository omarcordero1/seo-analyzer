const DELAY_BETWEEN_REQUESTS = 10000;
const MAX_RETRIES = 3;
const RETRY_DELAY = 15000;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const analyzeContent = async (url, retryCount = 0) => {
   try {
       await delay(DELAY_BETWEEN_REQUESTS);

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
                   content: "Analiza el siguiente URL y proporciona un breve análisis SEO."
               }, {
                   role: "user", 
                   content: `Por favor analiza el SEO de: ${url}\n\nProporciona análisis enfocado en:\n- Título y meta descripción\n- Estructura de encabezados\n- Palabras clave\n- SEO técnico básico`
               }],
               temperature: 0.7,
               max_tokens: 200,
               top_p: 1,
               frequency_penalty: 0,
               presence_penalty: 0
           })
       });

       if (!response.ok) {
           if (response.status === 429 && retryCount < MAX_RETRIES) {
               console.log(`Límite excedido. Reintentando en ${RETRY_DELAY}ms...`);
               await delay(RETRY_DELAY * (retryCount + 1));
               return analyzeContent(url, retryCount + 1);
           }
           throw new Error(`Error API: ${response.status}`);
       }

       const data = await response.json();
       
       if (!data || !data.choices || !data.choices[0] || !data.choices[0].message) {
           throw new Error('Respuesta inválida de la API');
       }

       return data.choices[0].message.content;

   } catch (error) {
       console.error(`Error analizando ${url}:`, error);
       
       if (retryCount < MAX_RETRIES) {
           console.log(`Reintentando análisis (${retryCount + 1}/${MAX_RETRIES})...`);
           await delay(RETRY_DELAY);
           return analyzeContent(url, retryCount + 1);
       }

       throw new Error(`Análisis fallido después de ${MAX_RETRIES} intentos: ${error.message}`);
   }
};

export { analyzeContent };