// src/services/openai-service.js
const DELAY_BETWEEN_REQUESTS = 10000; // 10 segundos entre solicitudes

const analyzeContent = async (url) => {
    try {
        const response = await fetch(url);
        const html = await response.text();

        // Extraer contenido principal
        const textContent = html.replace(/<[^>]*>/g, ' ')
                              .replace(/\s+/g, ' ')
                              .trim()
                              .slice(0, 1000); // Limitar longitud

        await new Promise(r => setTimeout(r, DELAY_BETWEEN_REQUESTS));

        const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.REACT_APP_OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [{
                    role: "system",
                    content: "Analiza SEO brevemente"
                }, {
                    role: "user",
                    content: `URL: ${url}\nContenido: ${textContent}`
                }],
                max_tokens: 150
            })
        });

        const data = await openaiResponse.json();
        return data.choices[0].message.content;
    } catch (error) {
        throw new Error(`Análisis fallido: ${error.message}`);
    }
};

export { analyzeContent };