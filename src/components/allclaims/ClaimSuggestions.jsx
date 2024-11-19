import React, { useState } from 'react';

const ClaimSuggestions = ({ selectedDocument }) => {
    // Sample data for demonstration
    const sampleMatches = [
        {
            claimId: '1',
            claimNumber: 'WC-2024-001',
            claimantName: 'John Smith',
            dateOfInjury: '2024-01-15',
            totalScore: 95,
            matchDetails: {
                claimNumber: { score: 30, matched: true },
                name: { score: 30, matched: true },
                dateOfInjury: { score: 20, matched: true },
                context: { score: 15, matched: true }
            },
            resonanceScore: 0.95
        },
        {
            claimId: '2',
            claimNumber: 'WC-2024-002',
            claimantName: 'Jane Doe',
            dateOfInjury: '2024-02-01',
            totalScore: 85,
            matchDetails: {
                claimNumber: { score: 30, matched: true },
                name: { score: 30, matched: true },
                dateOfInjury: { score: 15, matched: false },
                context: { score: 10, matched: true }
            },
            resonanceScore: 0.85
        }
    ];

    return (
        <div className="bg-white p-6 rounded-lg shadow-lg">
            {/* Header with gradient line */}
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Quantum Match Analysis
                </h2>
                <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded"></div>
            </div>

            {/* Main content */}
            <div className="space-y-4">
                {sampleMatches.map((match, index) => (
                    <div key={index} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                        {/* Match header */}
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">{match.claimNumber}</h3>
                            <span className="text-sm text-gray-500">
                                Resonance: {match.resonanceScore * 100}%
                            </span>
                        </div>

                        {/* Quantum score visualization */}
                        <div className="relative h-8 mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-20 rounded-full"></div>
                            <div 
                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500"
                                style={{ width: `${match.totalScore}%` }}
                            >
                                <div className="absolute right-0 top-0 h-full w-1 bg-white animate-pulse"></div>
                            </div>
                            <span className="absolute right-0 top-1/2 -translate-y-1/2 text-sm font-medium">
                                {match.totalScore}%
                            </span>
                        </div>

                        {/* Match details */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Claimant</p>
                                <p className="font-medium">{match.claimantName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Date of Injury</p>
                                <p className="font-medium">{match.dateOfInjury}</p>
                            </div>
                        </div>

                        {/* Quantum state indicators */}
                        <div className="flex space-x-2 mt-4">
                            {Object.entries(match.matchDetails).map(([key, value]) => (
                                <div 
                                    key={key}
                                    className="relative group"
                                >
                                    <div 
                                        className={`w-3 h-3 rounded-full ${
                                            value.matched 
                                                ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                                : 'bg-gradient-to-r from-red-400 to-red-600'
                                        } animate-pulse`}
                                    >
                                    </div>
                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded p-1 mb-1 whitespace-nowrap">
                                        {key}: {value.score} points
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Action button */}
                        <button className="mt-4 w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-lg hover:from-indigo-600 hover:to-purple-600 transition-all duration-200">
                            Confirm Match
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ClaimSuggestions;