import React from 'react';
import * as XLSX from 'xlsx';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import { Download, Filter } from 'lucide-react';

const Report = ({ analysisData }) => {
    const exportToExcel = () => {
        // Preparar los datos para exportación
        const exportData = analysisData.map(item => ({
            Editor: item.editor,
            URL: item.url,
            'Puntuación SEO': Math.round(item.seoScore),
            'Calidad de Contenido': Math.round(item.contentQuality.readability),
            'Keywords': item.keywords.join(', '),
            'Recomendaciones': item.recommendations.join('; '),
            'Fecha de Análisis': new Date().toLocaleDateString()
        }));

        // Crear el libro de trabajo
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Análisis SEO");

        // Guardar el archivo
        XLSX.writeFile(wb, `analisis-seo-${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return (
        <div className="p-4">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Reporte de Análisis SEO</CardTitle>
                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            <Download className="h-4 w-4" />
                            Exportar a Excel
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-6">
                        {/* Resumen de Datos */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total de URLs Analizadas</p>
                                <p className="text-2xl font-bold">{analysisData.length}</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Promedio SEO</p>
                                <p className="text-2xl font-bold">
                                    {Math.round(
                                        analysisData.reduce((acc, item) => acc + item.seoScore, 0) / analysisData.length
                                    )}%
                                </p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <p className="text-sm text-gray-500">Total de Editores</p>
                                <p className="text-2xl font-bold">
                                    {new Set(analysisData.map(item => item.editor)).size}
                                </p>
                            </div>
                        </div>

                        {/* Tabla de Resultados */}
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Editor
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            URL
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SEO Score
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Keywords
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {analysisData.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {item.editor}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <a 
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:underline"
                                                >
                                                    {item.url}
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {Math.round(item.seoScore)}%
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-2">
                                                    {item.keywords.map((keyword, i) => (
                                                        <span 
                                                            key={i}
                                                            className="px-2 py-1 bg-gray-100 rounded-full text-xs"
                                                        >
                                                            {keyword}
                                                        </span>
                                                    ))}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Report;
