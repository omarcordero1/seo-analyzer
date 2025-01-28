// src/services/openai-service.js
const analyzeContent = async (data) => {
    try {
        // Preparar datos para el análisis
        const urlsToAnalyze = data.map(item => ({
            editor: item.editor,
            url: item.url,
            titulo: item.titulo
        }));

        const prompt = `Analiza los siguientes artículos y proporciona un análisis SEO específico para cada uno:

${urlsToAnalyze.map((item, index) => `
Artículo ${index + 1}:
Editor: ${item.editor}
URL: ${item.url}
Título: ${item.titulo}
`).join('\n')}

Para cada artículo, proporciona:
1. Evaluación del título y meta descripción
2. Palabras clave recomendadas
3. Recomendaciones técnicas específicas
4. Puntuación SEO estimada (0-100)`;

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
                    content: "Eres un experto en SEO. Proporciona análisis concisos y específicos."
                }, {
                    role: "user",
                    content: prompt
                }],
                temperature: 0.5,
                max_tokens: 1500
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error API: ${response.status} - ${errorData.error?.message || 'Error desconocido'}`);
        }

        const result = await response.json();
        return result.choices[0].message.content;

    } catch (error) {
        console.error('Error en análisis:', error);
        throw new Error(`Error en análisis: ${error.message}`);
    }
};

export { analyzeContent };