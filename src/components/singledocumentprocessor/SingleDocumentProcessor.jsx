import React, { useEffect, useState } from 'react';
import MatchScoreIndicator from '../suggestedclaims/MatchScoreIndicator';

const SingleDocumentProcessor = ({ document, onProcessComplete }) => {
    const [matchDetails, setMatchDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [showFullHistory, setShowFullHistory] = useState(false);

    useEffect(() => {
        if (document?.OcrId) {
            console.log('SingleDocumentProcessor received document with OcrId:', document.OcrId);
            fetchDocumentMatchDetails(document.OcrId);
        }
    }, [document]);

    const fetchDocumentMatchDetails = async (OcrId) => {
        try {
            setLoading(true);
            const response = await fetch(`http://localhost:4000/ai/document-match-details/${OcrId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch match details');
            }

            const data = await response.json();
            console.log('Received match details for OcrId:', OcrId, data);
            
            // Transform the data to match our expected format
            const transformedData = {
                ...data,
                matchHistory: data.matchHistory?.map(match => ({
                    matchedAt: match.matchedAt,
                    score: match.score,
                    matchedFields: match.matches?.matchedFields || match.matchedFields || [],
                    confidence: match.matches?.confidence || match.confidence || {},
                    matchDetails: {
                        claimNumber: match.claim?.claimNumber || match.matchDetails?.claimNumber,
                        claimantName: match.claim?.name || match.matchDetails?.claimantName,
                        physicianName: match.claim?.physicianName || match.matchDetails?.physicianName,
                        dateOfInjury: match.claim?.dateOfInjury || match.matchDetails?.dateOfInjury,
                        employerName: match.claim?.employerName || match.matchDetails?.employerName
                    },
                    isRecommended: match.isRecommended
                }))
            };

            setMatchDetails(transformedData);
            onProcessComplete?.(OcrId, transformedData);
        } catch (error) {
            console.error('Error fetching match details for OcrId:', OcrId, error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleHistory = () => {
        setShowFullHistory(!showFullHistory);
    };

    if (loading) return <div>Loading match details...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!matchDetails?.matchHistory?.length) return null;

    const latestMatch = matchDetails.matchHistory[0];
    const displayHistory = showFullHistory ? matchDetails.matchHistory : (latestMatch ? [latestMatch] : []);

    return (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
            {/* Document Header */}
            <div className="mb-4 flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-semibold">{document?.fileName || 'Unnamed Document'}</h3>
                    <p className="text-sm text-gray-600">OcrId: {document?.OcrId}</p>
                </div>
                {matchDetails?.matchHistory?.length > 1 && (
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
                            <th className="px-4 py-2">Match Date</th>
                            <th className="px-4 py-2">Score</th>
                            <th className="px-4 py-2">Claim Details</th>
                            <th className="px-4 py-2">Matched Fields</th>
                            <th className="px-4 py-2">Confidence</th>
                            <th className="px-4 py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayHistory.map((match, index) => (
                            <tr key={index} className="border-t">
                                <td className="px-4 py-2">
                                    {match?.matchedAt ? new Date(match.matchedAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-4 py-2">
                                    <MatchScoreIndicator 
                                        score={match?.score || 0}
                                        matchDetails={{
                                            matchedFields: match.matchedFields,
                                            confidence: match.confidence,
                                            isRecommended: match.isRecommended
                                        }}
                                    />
                                </td>
                                <td className="px-4 py-2">
                                    <div className="space-y-1">
                                        <div>Claim #: {match?.matchDetails?.claimNumber || 'N/A'}</div>
                                        <div>Name: {match?.matchDetails?.claimantName || 'N/A'}</div>
                                        <div>DOI: {match?.matchDetails?.dateOfInjury ? 
                                            new Date(match.matchDetails.dateOfInjury).toLocaleDateString() : 'N/A'}</div>
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="flex flex-wrap gap-1">
                                        {match?.matchedFields?.map((field, i) => (
                                            <span key={i} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                                {field}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
                                    <div className="space-y-1">
                                        {Object.entries(match?.confidence || {}).map(([field, value]) => (
                                            <div key={field} className="text-xs">
                                                {field}: {Math.round(value * 100)}%
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-4 py-2">
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

export default SingleDocumentProcessor; 