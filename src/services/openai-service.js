// src/services/openai-service.js

const analyzeContent = async (data) => {
    try {
        // Preparar datos para el análisis
        const urlsToAnalyze = data.map(item => ({
            editor: item.editor,
            url: item.url,
            titulo: item.titulo
        }));
 
        const prompt = `Por favor realiza un análisis SEO de los siguientes artículos:
 
 ${urlsToAnalyze.map((item, index) => `
 ${index + 1}. Artículo por ${item.editor}
 URL: ${item.url}
 Título: ${item.titulo}
 `).join('\n')}
 
 Para cada artículo proporciona:
 - Evaluación del título
 - Recomendaciones SEO principales
 - Puntos de mejora
 `;
 
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
                    content: "Eres un experto en SEO especializado en análisis de contenido editorial. Proporciona análisis concisos y accionables."
                }, {
                    role: "user",
                    content: prompt
                }],
                temperature: 0.7,
                max_tokens: 2000,
                presence_penalty: 0.1,
                frequency_penalty: 0.1
            })
        });
 
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Error API: ${response.status} - ${errorData.error?.message || 'Error desconocido'}`);
        }
 
        const result = await response.json();
        
        if (!result.choices || !result.choices[0] || !result.choices[0].message) {
            throw new Error('Respuesta inválida de la API');
        }
 
        return result.choices[0].message.content;
 
    } catch (error) {
        console.error('Error en el análisis:', error);
        throw new Error(`No se pudo completar el análisis: ${error.message}`);
    }
 };
 
 export { analyzeContent };