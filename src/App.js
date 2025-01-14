import React, { useState } from 'react';
import SEOAnalyzer from './components/SEOAnalyzer';
import Dashboard from './components/Dashboard';
import Report from './components/Report';

function App() {
    const [analysisData, setAnalysisData] = useState([]);
    const [activeTab, setActiveTab] = useState('analyzer');

    return (
        <div className="min-h-screen bg-gray-50">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="flex space-x-8 h-16">
                        <button
                            onClick={() => setActiveTab('analyzer')}
                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                activeTab === 'analyzer'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Analizador
                        </button>
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                activeTab === 'dashboard'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('report')}
                            className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                                activeTab === 'report'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Reportes
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {activeTab === 'analyzer' && (
                    <SEOAnalyzer onAnalysisComplete={setAnalysisData} />
                )}
                {activeTab === 'dashboard' && (
                    <Dashboard analysisData={analysisData} />
                )}
                {activeTab === 'report' && (
                    <Report analysisData={analysisData} />
                )}
            </main>
        </div>
    );
}

export default App;