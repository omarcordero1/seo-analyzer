import React from 'react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    LineChart, Line, PieChart, Pie, Cell 
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card.jsx';
import _ from 'lodash';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const Dashboard = ({ analysisData }) => {
    const editorStats = React.useMemo(() => {
        return _.chain(analysisData)
            .groupBy('editor')
            .map((articles, editor) => ({
                editor,
                avgSEOScore: _.meanBy(articles, 'seoScore'),
                articlesCount: articles.length,
                performance: _.meanBy(articles, 'contentQuality.readability')
            }))
            .value();
    }, [analysisData]);

    const overallStats = React.useMemo(() => {
        return {
            totalArticles: analysisData.length,
            avgSEOScore: _.meanBy(analysisData, 'seoScore'),
            topPerformers: _.orderBy(analysisData, ['seoScore'], ['desc']).slice(0, 5),
            needsImprovement: _.orderBy(analysisData, ['seoScore'], ['asc']).slice(0, 5)
        };
    }, [analysisData]);

    return (
        <div className="p-4 space-y-6">
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Total de Artículos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{overallStats.totalArticles}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Promedio SEO</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">
                            {Math.round(overallStats.avgSEOScore)}%
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Artículos Analizados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-16">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={analysisData}>
                                    <Line 
                                        type="monotone" 
                                        dataKey="seoScore" 
                                        stroke="#8884d8" 
                                        strokeWidth={2} 
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Gráfico de Rendimiento por Editor */}
            <Card>
                <CardHeader>
                    <CardTitle>Rendimiento por Editor</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={editorStats}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="editor" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="avgSEOScore" name="SEO Score" fill="#0088FE" />
                                <Bar dataKey="performance" name="Rendimiento" fill="#00C49F" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </CardContent>
            </Card>

            {/* Top Performers y Necesitan Mejoras */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Mejores Artículos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {overallStats.topPerformers.map((article, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="font-medium truncate">{article.editor}</p>
                                        <a 
                                            href={article.url} 
                                            className="text-sm text-blue-600 hover:underline truncate block"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {article.url}
                                        </a>
                                    </div>
                                    <span className="ml-4 font-bold">
                                        {Math.round(article.seoScore)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Necesitan Mejoras</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {overallStats.needsImprovement.map((article, index) => (
                                <div key={index} className="flex justify-between items-center">
                                    <div className="flex-1">
                                        <p className="font-medium truncate">{article.editor}</p>
                                        <a 
                                            href={article.url} 
                                            className="text-sm text-blue-600 hover:underline truncate block"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            {article.url}
                                        </a>
                                    </div>
                                    <span className="ml-4 font-bold text-red-500">
                                        {Math.round(article.seoScore)}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
