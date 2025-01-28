// src/components/SEOAnalyzer.js
import React, { useState } from 'react';
import Papa from 'papaparse';
import { analyzeContent } from '../services/openai-service';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { FileText, AlertCircle } from 'lucide-react';

const SEOAnalyzer = () => {
   const [results, setResults] = useState(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState(null);

   const handleFileUpload = async (event) => {
       setLoading(true);
       setError(null);
       
       try {
           const file = event.target.files[0];
           if (!file) return;

           const text = await file.text();
           
           Papa.parse(text, {
               header: true,
               skipEmptyLines: true,
               complete: async (results) => {
                   try {
                       if (results.data?.length > 0) {
                           console.log('Datos CSV:', results.data);
                           const analysis = await analyzeContent(results.data);
                           setResults({
                               data: results.data,
                               analysis
                           });
                       }
                   } catch (err) {
                       setError(`Error en análisis: ${err.message}`);
                   }
               },
               error: (error) => {
                   setError(`Error en CSV: ${error.message}`);
               }
           });
       } catch (err) {
           setError(`Error: ${err.message}`);
       } finally {
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
                           <div className="text-center p-4">
                               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                               <p className="mt-2 text-gray-600">Analizando contenido...</p>
                           </div>
                       )}

                       {results && (
                           <Card>
                               <CardContent className="p-6">
                                   <div className="prose max-w-none">
                                       <h3 className="text-lg font-semibold mb-4">Resultados del Análisis</h3>
                                       <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
                                           {results.analysis}
                                       </pre>
                                   </div>
                               </CardContent>
                           </Card>
                       )}
                   </div>
               </CardContent>
           </Card>
       </div>
   );
};

export default SEOAnalyzer;