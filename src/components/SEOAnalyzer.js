// src/components/SEOAnalyzer.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import { analyzeContent } from '../services/openai-service';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { FileText, AlertCircle } from 'lucide-react';

const SEOAnalyzer = () => {
   const [fileData, setFileData] = useState(null);
   const [results, setResults] = useState([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);
   const [progress, setProgress] = useState(0);

   const analyzeUrls = async (data) => {
       const analyzedResults = [];
       const total = data.length;

       try {
           for (let i = 0; i < data.length; i++) {
               const row = data[i];
               console.log(`Analizando URL ${i + 1}/${total}: ${row.url}`);

               try {
                   if (i > 0) {
                       await new Promise(resolve => setTimeout(resolve, 2000));
                   }

                   const analysisResult = await analyzeContent(row.url);
                   console.log('Resultado análisis:', analysisResult);

                   analyzedResults.push({
                       ...row,
                       seoScore: Math.floor(Math.random() * 40) + 60,
                       analysis: analysisResult,
                       date: new Date().toISOString()
                   });

                   setProgress(((i + 1) / total) * 100);

               } catch (err) {
                   console.error(`Error en URL ${row.url}:`, err);
                   setError(`Error: ${err.message}`);
               }
           }

           setResults(analyzedResults);
           console.log('Análisis completado:', analyzedResults);

       } catch (err) {
           setError('Error en análisis: ' + err.message);
       } finally {
           setLoading(false);
       }
   };

   const handleFileUpload = async (event) => {
       setLoading(true);
       setError(null);
       setProgress(0);
       
       try {
           const file = event.target.files[0];
           console.log('Archivo seleccionado:', file);

           const text = await file.text();
           
           Papa.parse(text, {
               header: true,
               skipEmptyLines: true,
               complete: async (results) => {
                   console.log('Datos CSV:', results.data);
                   if (results.data?.length > 0) {
                       setFileData(results.data);
                       await analyzeUrls(results.data);
                   } else {
                       throw new Error('CSV vacío o inválido');
                   }
               },
               error: (error) => {
                   throw new Error(`Error CSV: ${error.message}`);
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
                               <p>El archivo CSV debe tener:</p>
                               <ul className="list-disc ml-5">
                                   <li>editor: Nombre del editor</li>
                                   <li>url: URL del artículo</li>
                                   <li>titulo: Título del artículo</li>
                               </ul>
                           </div>
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
                                   Analizando... {Math.round(progress)}%
                               </p>
                           </div>
                       )}

                       {results.length > 0 && (
                           <div className="space-y-6">
                               {results.map((result, index) => (
                                   <Card key={index}>
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
                                                       {result.titulo || result.url}
                                                   </a>
                                                   <div className="mt-4">
                                                       <h4 className="font-medium mb-2">Análisis SEO:</h4>
                                                       <pre className="whitespace-pre-wrap text-sm text-gray-600 bg-gray-50 p-4 rounded">
                                                           {result.analysis}
                                                       </pre>
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