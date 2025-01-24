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
       const results = [];

       try {
           for (let i = 0; i < data.length; i++) {
               const row = data[i];
               console.log(`Analizando URL ${i + 1}/${data.length}: ${row.url}`);

               try {
                   await new Promise(r => setTimeout(r, 10000)); // Espera 10s entre URLs
                   
                   const analysis = await analyzeContent(row.url);
                   results.push({
                       ...row,
                       analysis,
                       status: 'success'
                   });
               } catch (err) {
                   console.error(`Error en URL ${row.url}:`, err);
                   results.push({
                       ...row,
                       error: err.message,
                       status: 'error'
                   });
               }

               const newProgress = ((i + 1) / data.length) * 100;
               setProgress(newProgress);
               setResults([...results]);
           }
       } catch (err) {
           setError(`Error general: ${err.message}`);
       } finally {
           setLoading(false);
       }
   };

   const handleFileUpload = async (event) => {
       try {
           const file = event.target.files[0];
           if (!file) return;

           const text = await file.text();
           setResults([]);
           
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

                       <div className="space-y-4">
                           {results.map((result, index) => (
                               <Card key={index}>
                                   <CardContent className="p-4">
                                       <h3 className="font-semibold mb-2">{result.editor}</h3>
                                       <a 
                                           href={result.url}
                                           target="_blank"
                                           rel="noopener noreferrer"
                                           className="text-blue-600 hover:underline block mb-2"
                                       >
                                           {result.titulo || result.url}
                                       </a>
                                       
                                       {result.status === 'error' ? (
                                           <div className="text-red-600 mt-2">
                                               Error: {result.error}
                                           </div>
                                       ) : (
                                           <div className="bg-gray-50 p-4 rounded mt-2">
                                               <pre className="whitespace-pre-wrap text-sm">
                                                   {result.analysis}
                                               </pre>
                                           </div>
                                       )}
                                   </CardContent>
                               </Card>
                           ))}
                       </div>
                   </div>
               </CardContent>
           </Card>
       </div>
   );
};

export default SEOAnalyzer;