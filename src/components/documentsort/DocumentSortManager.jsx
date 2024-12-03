import React, { useState, useEffect, useContext } from 'react';
import { MatchContext } from '../matchcontext/MatchContext';

const DocumentSortManager = ({ document, onSortComplete }) => {
    const { getMatchHistory } = useContext(MatchContext);
    const [sortStatus, setSortStatus] = useState('pending'); // pending, sorting, sorted, error
    const [matchHistory, setMatchHistory] = useState(null);
    const [sortResults, setSortResults] = useState(null);

    useEffect(() => {
        // Fetch match history when component mounts
        if (document?.OcrId) {
            loadMatchHistory();
        }
    }, [document?.OcrId]);

    const loadMatchHistory = async () => {
        try {
            const history = await getMatchHistory(document.OcrId);
            setMatchHistory(history);
        } catch (error) {
            console.error('Error loading match history:', error);
        }
    };

    const handleSort = async () => {
        setSortStatus('sorting');
        try {
            // Call your sorting endpoint
            const response = await fetch(`http://localhost:4000/dms/sort/${document.OcrId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    matchHistory: matchHistory,
                    documentId: document.OcrId
                })
            });

            const result = await response.json();
            setSortResults(result);
            setSortStatus('sorted');
            onSortComplete?.(result);
        } catch (error) {
            console.error('Error sorting document:', error);
            setSortStatus('error');
        }
    };

    return (
        <div className="flex items-center space-x-4">
            {/* Match History Display */}
            <div className="flex-1">
                {matchHistory && (
                    <div className="text-sm">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">
                                Best Match: {matchHistory.matchResults?.[0]?.claim?.claimNumber || 'No match'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                matchHistory.topScore >= 75 ? 'bg-green-100 text-green-800' :
                                matchHistory.topScore >= 46 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {matchHistory.topScore?.toFixed(1)}%
                            </span>
                        </div>
                        {matchHistory.matchResults?.[0]?.matchedFields && (
                            <div className="text-xs text-gray-500 mt-1">
                                Matched: {matchHistory.matchResults[0].matchedFields.join(', ')}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Sort Status & Controls */}
            <div className="flex items-center space-x-2">
                {sortStatus === 'sorted' && (
                    <span className="text-green-600 text-sm">✓ Sorted</span>
                )}
                {sortStatus === 'error' && (
                    <span className="text-red-600 text-sm">⚠ Error</span>
                )}
                <button
                    onClick={handleSort}
                    disabled={sortStatus === 'sorting'}
                    className={`px-3 py-1 rounded-md text-sm ${
                        sortStatus === 'sorting'
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white'
                    }`}
                >
                    {sortStatus === 'sorting' ? 'Sorting...' : 'Sort'}
                </button>
            </div>
        </div>
    );
};

export default DocumentSortManager; 