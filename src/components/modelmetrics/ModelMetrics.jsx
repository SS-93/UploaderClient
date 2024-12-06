import React, { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';






function ModelMetrics() {
  
    
    const ModelMetrics = () => {
        const [metrics, setMetrics] = useState(null);
        const [comparison, setComparison] = useState(null);
        const [loading, setLoading] = useState(true);
        const [error, setError] = useState(null);
    
        useEffect(() => {
            fetchMetrics();
        }, []);
    
        const fetchMetrics = async () => {
            try {
                const response = await fetch('http://localhost:4000/ai/model-metrics');
                if (!response.ok) {
                    throw new Error('Failed to fetch metrics');
                }
                const data = await response.json();
                setMetrics(data.metrics);
                setComparison(data.comparison);
            } catch (error) {
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
    
        if (loading) return <div>Loading metrics...</div>;
        if (error) return <div>Error: {error}</div>;
        if (!metrics || !comparison) return <div>No metrics available</div>;
  
  
    return (




    <div>ModelMetrics

<div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-2xl font-bold mb-6">Model Performance Metrics</h2>
            
            {/* Comparison Table */}
            <div className="mb-8 overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-3 text-left">Model</th>
                            <th className="px-6 py-3 text-left">Avg. Processing Time</th>
                            <th className="px-6 py-3 text-left">Total Cost</th>
                            <th className="px-6 py-3 text-left">Avg. Entities Found</th>
                            <th className="px-6 py-3 text-left">Total Calls</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comparison.map((model, index) => (
                            <tr key={model.model} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="px-6 py-4">{model.model}</td>
                                <td className="px-6 py-4">{model.avgProcessingTime}</td>
                                <td className="px-6 py-4">{model.totalCost}</td>
                                <td className="px-6 py-4">{model.avgEntityCount}</td>
                                <td className="px-6 py-4">{model.totalCalls}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Performance Chart */}
            <div className="h-96 mb-8">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={comparison}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="model" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="avgEntityCount" fill="#8884d8" name="Avg. Entities" />
                        <Bar dataKey="totalCalls" fill="#82ca9d" name="Total Calls" />
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Historical Data */}
            <div>
                <h3 className="text-xl font-semibold mb-4">Historical Performance</h3>
                {Object.entries(metrics).map(([modelName, data]) => (
                    <div key={modelName} className="mb-6">
                        <h4 className="text-lg font-medium mb-2">{modelName}</h4>
                        <div className="bg-gray-50 p-4 rounded">
                            <p>Latest calls:</p>
                            <ul className="list-disc pl-5">
                                {data.history.slice(-5).map((entry, index) => (
                                    <li key={index} className="text-sm">
                                        {new Date(entry.timestamp).toLocaleString()} - 
                                        Duration: {entry.duration}ms, 
                                        Cost: ${entry.estimatedCost.toFixed(4)}, 
                                        Entities: {entry.entityCount}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    </div>
  )
}
}

export default ModelMetrics


 