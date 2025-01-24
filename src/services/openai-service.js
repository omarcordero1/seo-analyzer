// src/services/openai-service.js
const RETRY_DELAY = 5000; // 5 segundos entre intentos
const MAX_RETRIES = 3;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const analyzeContent = async (content, retryCount = 0) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo-preview",
                messages: [{
                    role: "system",
                    content: "Analiza el contenido SEO de este artículo y proporciona un análisis estructurado."
                }, {
                    role: "user",
                    content: `URL: ${content}\nProporciona un análisis SEO detallado.`
                }]
            })
        });

        if (response.status === 429) {
            if (retryCount < MAX_RETRIES) {
                await delay(RETRY_DELAY);
                return analyzeContent(content, retryCount + 1);
            }
            throw new Error('Límite de peticiones excedido después de varios intentos.');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error en analyzeContent:', error);
        throw error;
    }
};

export { analyzeContent };