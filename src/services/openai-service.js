// src/services/openai-service.js
const analyzeContent = async (content) => {
    try {
        // Añadir delay entre peticiones
        await new Promise(resolve => setTimeout(resolve, 2000));

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
                    content: `URL: ${content}\nProporciona un análisis SEO detallado incluyendo puntuación, palabras clave y recomendaciones.`
                }],
                temperature: 0.7
            })
        });

        if (response.status === 429) {
            throw new Error('Límite de peticiones excedido. Por favor, espera unos segundos.');
        }

        if (!response.ok) {
            throw new Error(`Error en la API: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error en analyzeContent:', error);
        throw error;
    }
};

export { analyzeContent };