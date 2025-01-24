// src/components/SEOAnalyzer.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import { analyzeContent } from '../services/openai-service';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { FileText, AlertCircle } from 'lucide-react';

const SEOAnalyzer = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);

    const analyzeUrls = async (data) => {
        setLoading(true);
        setError(null);
        setProgress(0);
        
        try {
            const batchSize = 3;
            const analyzedResults = [];

            for (let i = 0; i < data.length; i += batchSize) {
                const batch = data.slice(i, i + batchSize);
                console.log(`Procesando lote ${i/batchSize + 1}`);

                const batchResults = await Promise.all(
                    batch.map(async (row) => {
                        try {
                            const analysis = await analyzeContent([row.url]);
                            return {
                                ...row,
                                analysis: analysis[0].analysis,
                                error: analysis[0].error
                            };
                        } catch (err) {
                            return {
                                ...row,
                                error: err.message
                            };
                        }
                    })
                );

                analyzedResults.push(...batchResults);
                const newProgress = Math.min(((i + batchSize) / data.length) * 100, 100);
                setProgress(newProgress);
                setResults(analyzedResults);

                // Esperar entre lotes
                await new Promise(r => setTimeout(r, 2000));
            }

        } catch (err) {
            console.error('Error en análisis:', err);
            setError(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (event) => {
        try {
            const file = event.target.files[0];
            const text = await file.text();
            
            Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
                complete: async (results) => {
                    if (results.data?.length > 0) {
                        await analyzeUrls(results.data);
                    } else {
                        throw new Error('CSV vacío o inválido');
                    }
                },
                error: (error) => {
                    throw new Error(`Error en CSV: ${error.message}`);
                }
            });
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Análisis SEO de Contenido</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <input
                                type="file"
                                accept=".csv"
                                onChange={handleFileUpload}
                                className="block w-full text-sm text-slate-500 
                                    file:mr-4 file:py-2 file:px-4 
                                    file:rounded-full file:border-0 
                                    file:text-sm file:font-semibold 
                                    file:bg-violet-50 file:text-violet-700 
                                    hover:file:bg-violet-100"
                            />
                            <div className="text-sm text-gray-500 mt-2">
                                <p>Formato del CSV:</p>
                                <ul className="list-disc ml-5">
                                    <li>editor: Nombre del editor</li>
                                    <li>url: URL del artículo</li>
                                    <li>titulo: Título del artículo</li>
                                </ul>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 p-4 rounded-md flex items-center gap-3 text-red-700">
                                <AlertCircle className="h-5 w-4" />
                                {error}
                            </div>
                        )}

                        {loading && (
                            <div className="space-y-4">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                                <p className="text-center text-sm text-gray-600">
                                    Analizando... {Math.round(progress)}%
                                </p>
                            </div>
                        )}

                        {results.map((result, index) => (
                            <Card key={index}>
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="text-lg font-semibold">
                                                    {result.editor}
                                                </h3>
                                                <a 
                                                    href={result.url} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600 hover:underline flex items-center gap-2"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    {result.titulo || result.url}
                                                </a>
                                            </div>
                                        </div>
                                        
                                        {result.error ? (
                                            <div className="text-red-600">
                                                Error: {result.error}
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-4 rounded-lg">
                                                <pre className="whitespace-pre-wrap text-sm">
                                                    {result.analysis}
                                                </pre>
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SEOAnalyzer;