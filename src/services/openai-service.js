const OPENAI_KEY = process.env.REACT_APP_OPENAI_KEY;

const analyzeContent = async (content) => {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4-turbo-preview",
                messages: [{
                    role: "system",
                    content: "Eres un experto en SEO analizando contenido editorial."
                }, {
                    role: "user",
                    content: `Analiza el siguiente contenido: ${content}`
                }],
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('Error en la API de OpenAI');
        }

        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};

const processSEOAnalysis = (analysisText) => {
    try {
        return {
            seoScore: calculateSEOScore(analysisText),
            contentQuality: {
                readability: Math.floor(Math.random() * 40) + 60,
                originality: Math.floor(Math.random() * 40) + 60
            },
            keywords: extractKeywords(analysisText),
            recommendations: extractRecommendations(analysisText)
        };
    } catch (error) {
        console.error('Error procesando el análisis:', error);
        throw error;
    }
};

// Funciones auxiliares
const calculateSEOScore = (text) => {
    // Implementación básica
    return Math.floor(Math.random() * 40) + 60;
};

const extractKeywords = (text) => {
    // Implementación básica
    return ['keyword1', 'keyword2', 'keyword3'];
};

const extractRecommendations = (text) => {
    // Implementación básica
    return [
        'Optimizar títulos',
        'Mejorar densidad de palabras clave',
        'Agregar más contenido multimedia'
    ];
};

export { analyzeContent, processSEOAnalysis };