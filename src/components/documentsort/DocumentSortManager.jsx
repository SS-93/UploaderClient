import React, { useState, useEffect, useContext } from 'react';
import { MatchContext } from '../matchcontext/MatchContext';

const DocumentSortManager = ({ 
    document, 
    documents = [], 
    documentMatchResults,
    onSortComplete,
    onBulkSortComplete 
}) => {
    const { getMatchHistory } = useContext(MatchContext);
    const [sortStatus, setSortStatus] = useState('pending');
    const [matchHistory, setMatchHistory] = useState(null);

    useEffect(() => {
        if (document?.OcrId) {
            if (documentMatchResults?.[document.OcrId]) {
                setMatchHistory(documentMatchResults[document.OcrId]);
            } else {
                loadMatchHistory();
            }
        }
    }, [document?.OcrId, documentMatchResults]);

    const loadMatchHistory = async () => {
        try {
            const response = await fetch(`http://localhost:4000/ai/document-match-details/${document.OcrId}`);
            if (!response.ok) throw new Error('Failed to fetch match details');
            const data = await response.json();
            setMatchHistory(data);
        } catch (error) {
            console.error('Error loading match history:', error);
        }
    };

    const handleSort = async () => {
        setSortStatus('sorting');
        try {
            const bestMatch = matchHistory?.matchResults?.[0];
            const targetClaimNumber = bestMatch?.claim?.claimNumber;

            if (!targetClaimNumber) {
                throw new Error('No target claim number found');
            }

            const claimResponse = await fetch(`http://localhost:4000/new/find-by-number/${targetClaimNumber}`);
            if (!claimResponse.ok) {
                throw new Error('Failed to find claim');
            }
            
            const claimData = await claimResponse.json();
            const claimId = claimData.found._id;

            const response = await fetch(
                `http://localhost:4000/dms/sort-document/${claimId}/${document.OcrId}`, 
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        claimNumber: targetClaimNumber,
                        matchScore: bestMatch.score
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Sort failed');
            }

            const result = await response.json();
            setSortStatus('sorted');
            onSortComplete?.(result);
        } catch (error) {
            console.error('Sort Error:', error);
            setSortStatus('error');
        }
    };

    return (
        <button
            onClick={handleSort}
            disabled={sortStatus === 'sorting' || !matchHistory?.matchResults?.[0]}
            className={`px-3 py-1 rounded-md text-sm font-medium ${
                sortStatus === 'sorting' 
                    ? 'bg-gray-300 cursor-not-allowed'
                    : sortStatus === 'sorted'
                    ? 'bg-green-500 text-white'
                    : sortStatus === 'error'
                    ? 'bg-red-500 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
        >
            {sortStatus === 'sorting' ? 'Sorting...' : 
             sortStatus === 'sorted' ? '✓ Sorted' :
             sortStatus === 'error' ? '⚠ Error' : 'Sort'}
        </button>
    );
};

export default DocumentSortManager; 