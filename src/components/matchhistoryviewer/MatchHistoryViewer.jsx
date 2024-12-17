import React, { useState } from 'react';
import MatchScoreIndicator from '../suggestedclaims/MatchScoreIndicator';

const MatchHistoryViewer = ({ document, matchHistory }) => {
    const [showFullHistory, setShowFullHistory] = useState(false);

    const toggleHistory = () => {
        setShowFullHistory(!showFullHistory);
    };

    if (!matchHistory?.length) return null;

    const latestMatch = matchHistory[0];
    const displayHistory = showFullHistory ? matchHistory : (latestMatch ? [latestMatch] : []);

    return (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
            {/* Document Header */}
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">{document?.fileName || 'Unnamed Document'}</h3>
                    <p className="text-sm text-gray-600">OcrId: {document?.OcrId}</p>
                </div>
                {matchHistory?.length > 1 && (
                    <button 
                        onClick={toggleHistory}
                        className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                    >
                        {showFullHistory ? 'Show Latest Only' : 'Show Full History'}
                    </button>
                )}
            </div>

            {/* Match History Table */}
            <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead>
                        <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-center">Match Date</th>
                            <th className="px-4 py-2 text-center">Score</th>
                            <th className="px-4 py-2 text-center">Claim Details</th>
                            <th className="px-4 py-2 text-center">Matched Fields</th>
                            <th className="px-4 py-2 text-center">Confidence</th>
                            <th className="px-4 py-2 text-center">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayHistory.map((match, index) => (
                            <tr key={index} className="border-t">
                                <td className="px-4 py-2 text-center">
                                    {match?.matchedAt ? new Date(match.matchedAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-2 text-center">
    <div className="space-y-2">
        {/* Score Progress Bar */}
        <div className="flex items-center space-x-2 justify-center">
            <div className="h-2 w-full bg-gray-200 rounded">
                <div 
                    className={`h-2 rounded ${
                        match?.score >= 60 ? 'bg-green-500' :
                        match?.score >= 45 ? 'bg-yellow-500' :
                        'bg-red-500'
                    }`}
                    style={{ width: `${match?.score || 0}%` }}
                ></div>
            </div>
            <span className="text-sm font-medium w-16 text-center">
                {match?.score?.toFixed(2) || 0}%
            </span>
        </div>
    </div>
</td>
                                <td className="px-4 py-2 text-center">
                                    <div className="space-y-1">
                                        <div>Claim #: {match?.matchDetails?.claimNumber || 'N/A'}</div>
                                        <div>Name: {match?.matchDetails?.claimantName || 'N/A'}</div>
                                        <div>DOI: {match?.matchDetails?.dateOfInjury ? 
                                            new Date(match.matchDetails.dateOfInjury).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-center">
    <div className="flex flex-wrap gap-1 justify-center">
        {Object.keys(match?.matchDetails || {}).map((field, i) => (
            <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {field.replace(/([A-Z])/g, ' $1').trim()}
            </span>
        ))}
    </div>
</td>
                                <td className="px-4 py-2 text-center">
                                    <div className="space-y-1">
                                        {Object.entries(match?.confidence || {}).map(([field, value]) => (
                                            <div key={field} className="text-xs">
                                                {field}: {Math.round(value * 100)}%
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-2 text-center">
                                    <span className={`px-2 py-1 rounded text-xs ${
                                        match?.isRecommended 
                                            ? 'bg-green-100 text-green-800' 
                                            : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                        {match?.isRecommended ? 'Recommended' : 'Review Needed'}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MatchHistoryViewer;