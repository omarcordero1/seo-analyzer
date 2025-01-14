import React, { useState } from 'react';
import Papa from 'papaparse';
import { analyzeContent, processSEOAnalysis } from '../services/openai-service';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { FileText, AlertCircle, Loader } from 'lucide-react';

const SEOAnalyzer = () => {
    const [fileData, setFileData] = useState(null);
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);

    const handleFileUpload = async (event) => {
        setLoading(true);
        setError(null);
        setProgress(0);
        
        try {
            const file = event.target.files[0];
            const text = await file.text();
            
            Papa.parse(text, {
                header: true,
                complete: async (results) => {
                    setFileData(results.data);
                    await analyzeUrls(results.data);
                },
                error: (error) => {
                    setError('Error al procesar el CSV: ' + error.message);
                }
            });
        } catch (err) {
            setError('Error al cargar el archivo: ' + err.message);
            setLoading(false);
        }
    };

    const analyzeUrls = async (data) => {
        const analyzedResults = [];
        const total = data.length;

        for (let i = 0; i < data.length; i++) {
            try {
                const row = data[i];
                const analysis = await analyzeContent(row.url);
                const processedAnalysis = processSEOAnalysis(analysis);
                
                analyzedResults.push({
                    ...row,
                    ...processedAnalysis
                });

                setProgress(((i + 1) / total) * 100);
            } catch (err) {
                console.error(`Error analyzing ${data[i].url}:`, err);
            }
        }

        setResults(analyzedResults);
        setLoading(false);
    };

    return (
        <div className="p-4 max-w-6xl mx-auto">
            <Card className="mb-6">
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
                            <p className="mt-2 text-sm text-gray-500">
                                Sube un archivo CSV con las columnas: editor, url, título
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 p-4 rounded-md flex items-center gap-3 text-red-700">
                                <AlertCircle className="h-5 w-5" />
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
                                    Analizando contenido... {Math.round(progress)}%
                                </p>
                            </div>
                        )}

                        {results.length > 0 && (
                            <div className="space-y-6">
                                {results.map((result, index) => (
                                    <Card key={index} className="overflow-hidden">
                                        <CardContent className="p-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <h3 className="text-lg font-semibold mb-2">
                                                        {result.editor}
                                                    </h3>
                                                    <a 
                                                        href={result.url} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:underline flex items-center gap-2 mb-4"
                                                    >
                                                        <FileText className="h-4 w-4" />
                                                        Ver artículo
                                                    </a>
                                                    
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium">Palabras clave:</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            {result.keywords.map((keyword, i) => (
                                                                <span 
                                                                    key={i}
                                                                    className="px-2 py-1 bg-gray-100 rounded-full text-sm"
                                                                >
                                                                    {keyword}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="space-y-4">
                                                    <h4 className="font-medium">Puntuaciones:</h4>
                                                    <div className="space-y-2">
                                                        <div>
                                                            <div className="flex justify-between mb-1">
                                                                <span className="text-sm">SEO General</span>
                                                                <span className="text-sm font-medium">
                                                                    {result.seoScore}%
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                                <div 
                                                                    className="bg-blue-600 rounded-full h-2"
                                                                    style={{ width: `${result.seoScore}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4">
                                                            <h4 className="font-medium mb-2">Recomendaciones:</h4>
                                                            <ul className="list-disc list-inside space-y-2">
                                                                {result.recommendations.map((rec, i) => (
                                                                    <li key={i} className="text-sm text-gray-600">
                                                                        {rec}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SEOAnalyzer;
