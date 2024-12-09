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
    const [sortResults, setSortResults] = useState(null);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (document?.OcrId) {
            loadMatchHistory();
        }
    }, [document?.OcrId]);

    const loadMatchHistory = async () => {
        try {
            const response = await fetch(`http://localhost:4000/ai/document-match-details/${document.OcrId}`);
            if (!response.ok) throw new Error('Failed to fetch match details');
            const data = await response.json();
            
            console.log('Loaded match history:', data);
            setMatchHistory(data);
        } catch (error) {
            console.error('Error loading match history:', error);
        }
    };

    const handleSort = async () => {
        setSortStatus('sorting');
        console.log('\n=== Starting Sort Process ===');
        console.log('Document:', document);
        console.log('Match History:', matchHistory);

        try {
            // Get the latest match from history
            const latestMatch = matchHistory?.matchHistory?.[0];
            const targetClaimNumber = latestMatch?.matchDetails?.claimNumber;

            if (!targetClaimNumber) {
                throw new Error('No target claim number found in match history');
            }

            // First, fetch the claim ID using claim number
            const claimResponse = await fetch(`http://localhost:4000/new/find-by-number/${targetClaimNumber}`);
            if (!claimResponse.ok) {
                throw new Error('Failed to find claim by number');
            }
            
            const claimData = await claimResponse.json();
            const claimId = claimData.found._id;

            console.log('Sort Details:', {
                OcrId: document.OcrId,
                targetClaimNumber,
                claimId,
                confidence: latestMatch.score
            });

            // Use the correct endpoint
            const response = await fetch(
                `http://localhost:4000/dms/sort-document/${claimId}/${document.OcrId}`, 
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        claimNumber: targetClaimNumber,
                        matchScore: latestMatch.score
                    })
                }
            );

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Sort operation failed');
            }

            const result = await response.json();
            console.log('Sort Result:', result);
            
            setSortResults(result);
            setSortStatus('sorted');
            onSortComplete?.(result);
        } catch (error) {
            console.error('Sort Error:', error);
            setSortStatus('error');
        }
    };

    const handleBulkSort = async () => {
        try {
            const documentsToSort = documents.map(doc => {
                const matchHistory = documentMatchResults[doc.OcrId]?.matchHistory || [];
                const bestMatch = matchHistory[0];
                
                return {
                    OcrId: doc.OcrId,
                    claimId: bestMatch?.matchDetails?.claimId,
                    matchScore: bestMatch?.score,
                    claimNumber: bestMatch?.matchDetails?.claimNumber
                };
            }).filter(doc => doc.claimId); // Only include docs with valid matches

            const response = await fetch(
                'http://localhost:4000/dms/sort-documents',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documents: documentsToSort })
                }
            );

            if (!response.ok) throw new Error('Bulk sort failed');
            
            const results = await response.json();
            onBulkSortComplete?.(results);
        } catch (error) {
            console.error('Bulk Sort Error:', error);
        }
    };

    const getConfidenceClass = (score) => {
        if (score >= 75) return 'bg-green-100 text-green-800';
        if (score >= 46) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    return (
        <div className="flex items-center space-x-4">
            <div className="flex-1">
                {matchHistory && matchHistory.matchHistory?.[0] && (
                    <div className="text-sm">
                        <div className="flex items-center space-x-2">
                            <span className="font-medium">
                                Best Match: {matchHistory.matchHistory[0].matchDetails?.claimNumber || 'No match'}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                                getConfidenceClass(matchHistory.matchHistory[0].score)
                            }`}>
                                {matchHistory.matchHistory[0].score?.toFixed(1)}%
                            </span>
                        </div>
                        {matchHistory.matchHistory[0].matchedFields && (
                            <div className="text-xs text-gray-500 mt-1">
                                Matched: {matchHistory.matchHistory[0].matchedFields.join(', ')}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-3">
                {sortStatus === 'sorted' && (
                    <span className="text-green-600 text-sm">✓ Sorted</span>
                )}
                {sortStatus === 'error' && (
                    <span className="text-red-600 text-sm">⚠ Error</span>
                )}
                {/* Regular Sort Button */}
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
                {/* Bulk Sort Button */}
                {/* <button
                    onClick={handleBulkSort}
                    disabled={processing || sortStatus === 'sorting'}
                    className={`px-3 py-1 rounded-md text-sm ${
                        processing || sortStatus === 'sorting'
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-coral-500 hover:bg-coral-600 text-white'
                    }`}
                    style={{ 
                        backgroundColor: processing || sortStatus === 'sorting' ? '#d1d5db' : '#FF7F50',
                        borderColor: '#FF6347'
                    }}
                >
                    {processing ? 'Processing...' : 'Bulk Sort'}
                </button> */}
            </div>
        </div>
    );
};

export default DocumentSortManager; 