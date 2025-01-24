// src/services/openai-service.js
const DELAY_BETWEEN_REQUESTS = 15000; // Aumentado a 15 segundos
const MAX_RETRIES = 3;
const BASE_DELAY = 20000; // Delay base de 20 segundos

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const analyzeContent = async (url, retryCount = 0) => {
    try {
        // Delay exponencial basado en intentos
        const waitTime = BASE_DELAY * Math.pow(2, retryCount);
        console.log(`Esperando ${waitTime/1000}s antes de analizar URL...`);
        await delay(waitTime);

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
                    content: "Analiza el SEO de la URL proporcionada"
                }, {
                    role: "user",
                    content: `URL a analizar: ${url}`
                }],
                temperature: 0.7,
                max_tokens: 150
            })
        });

        if (response.status === 429) {
            if (retryCount < MAX_RETRIES) {
                console.log(`Rate limit alcanzado. Reintento ${retryCount + 1}/${MAX_RETRIES}`);
                return analyzeContent(url, retryCount + 1);
            }
            throw new Error('Límite de solicitudes alcanzado');
        }

        if (!response.ok) {
            throw new Error(`Error API: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content || 'No se pudo obtener análisis';

    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

export { analyzeContent };