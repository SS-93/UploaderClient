import React, { useState, useContext } from 'react';
import { MatchContext } from '../matchcontext/MatchContext';

const BulkSortManager = ({ 
    selectedDocuments = [], 
    documentMatchResults,
    onBulkSortComplete 
}) => {
    const [processing, setProcessing] = useState(false);
    const [sortStatus, setSortStatus] = useState('pending');
    const { getMatchHistory } = useContext(MatchContext);

    const handleBulkSort = async () => {
        if (!selectedDocuments.length) return;
        
        setProcessing(true);
        setSortStatus('sorting');

        try {
            console.log('Processing documents:', selectedDocuments);
            console.log('Match results:', documentMatchResults);

            const documentsToSort = await Promise.all(
                selectedDocuments.map(async (doc) => {
                    try {
                        // Get match history if not already available
                        const response = await fetch(`http://localhost:4000/ai/document-match-details/${doc.OcrId}`);
                        if (!response.ok) throw new Error(`Failed to fetch match details for ${doc.OcrId}`);
                        
                        const data = await response.json();
                        console.log(`Match data for ${doc.OcrId}:`, data);

                        // Check for match results in the new format
                        const bestMatch = data?.matchResults?.[0];
                        if (!bestMatch?.claim?.claimNumber) {
                            console.warn(`No valid match found for document ${doc.OcrId}`);
                            return null;
                        }

                        return {
                            OcrId: doc.OcrId,
                            claimNumber: bestMatch.claim.claimNumber,
                            matchScore: bestMatch.score || 0
                        };
                    } catch (error) {
                        console.error(`Error processing document ${doc.OcrId}:`, error);
                        return null;
                    }
                })
            );

            const validDocuments = documentsToSort.filter(doc => doc !== null);
            console.log('Valid documents to sort:', validDocuments);

            if (!validDocuments.length) {
                throw new Error('No valid documents to sort');
            }

            console.log('Sending documents for sorting:', validDocuments);

            const response = await fetch(
                'http://localhost:4000/dms/bulk-sort-documents',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documents: validDocuments })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Bulk sort operation failed');
            }

            const results = await response.json();
            console.log('Bulk sort results:', results);
            onBulkSortComplete?.(results);
            setSortStatus('sorted');

        } catch (error) {
            console.error('Bulk Sort Error:', error);
            setSortStatus('error');
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {selectedDocuments.length > 0 ? 'Selected Documents' : 'Document Details'}
                </h2>
                <div className="flex items-center space-x-2">
                    {selectedDocuments.length > 0 && (
                        <button
                            onClick={handleBulkSort}
                            disabled={processing || sortStatus === 'sorting'}
                            className={`px-4 py-2 rounded-md text-sm font-medium ${
                                processing || sortStatus === 'sorting'
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'text-white'
                            }`}
                            style={{ 
                                backgroundColor: processing || sortStatus === 'sorting' ? '#d1d5db' : '#FF7F50',
                                borderColor: '#FF6347'
                            }}
                        >
                            {processing ? 'Processing...' : `Bulk Sort (${selectedDocuments.length})`}
                        </button>
                    )}
                    {sortStatus === 'error' && (
                        <span className="text-red-600 text-sm">⚠ Error occurred</span>
                    )}
                    {sortStatus === 'sorted' && (
                        <span className="text-green-600 text-sm">✓ Documents sorted</span>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BulkSortManager; 