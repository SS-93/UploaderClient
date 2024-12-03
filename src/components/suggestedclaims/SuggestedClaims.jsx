import React, { useEffect, useContext, useCallback, useState, memo } from 'react';
import MatchScoreIndicator from './MatchScoreIndicator';
import { MatchContext } from '../matchcontext/MatchContext';
import BatchProcessingStatus from './BatchProcessingStatus';
import DocumentSortManager from '../documentsort/DocumentSortManager';
import MatchHistoryCell from './MatchHistoryCell';
import SingleDocumentProcessor from '../singledocumentprocessor/SingleDocumentProcessor';

const SuggestedClaims = ({ selectedDocument, selectedDocuments = [], processingEnabled, sortResults, aiMatchResults }) => {
    const { 
        detailedMatches, 
        loading, 
        error, 
        findMatches,
        getMatchHistory,
        matchHistory,
        lastUpdated,                
        saveMatchHistory,
        processBatch
    } = useContext(MatchContext);

    // Add state for match results with default empty object
    const [matchResults, setMatchResults] = useState({});

    // Add state for batch processing
    const [batchId, setBatchId] = useState(null);
    const [batchResults, setBatchResults] = useState({
        processed: 0,
        total: 0,
        success: [],
        failed: []
    });
    const [batchProcessing, setBatchProcessing] = useState({
        total: 0,
        success: [],
        failed: []
    });

    // Add state for details modal
    const [selectedDetails, setSelectedDetails] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Add state for tracking checked documents
    const [checkedDocuments, setCheckedDocuments] = useState([]);

    // Handle single document selection
    useEffect(() => {
        if (selectedDocument?.OcrId) {
            getMatchHistory(selectedDocument.OcrId);
        }
    }, [selectedDocument?.OcrId]);

    // Safely check for selected documents
    const hasSelectedDocuments = Array.isArray(selectedDocuments) && selectedDocuments.length > 0;

    useEffect(() => {
        const fetchMatchResults = async () => {
            if (!selectedDocument?.OcrId) {
                return; // Exit early if no OcrId
            }
            
            try {
                await getMatchHistory(selectedDocument.OcrId);
            } catch (error) {
                console.error('Error fetching match results:', error);
            }
        };

        fetchMatchResults();
    }, [selectedDocument?.OcrId]); // Only depend on OcrId changes

    // Handle batch document processing
    const processBatchDocuments = async (documents) => {
        for (const doc of documents) {
            setBatchProcessing(prev => ({ ...prev, [doc.OcrId]: true }));
            try {
                if (doc.entities) {
                    const results = await findMatches(doc.entities);
                    setBatchResults(prev => ({
                        ...prev,
                        [doc.OcrId]: {
                            matches: results.matchResults || [],
                            topScore: results.topScore,
                            processed: true,
                            timestamp: new Date()
                        }
                    }));
                }
            } catch (error) {
                console.error(`Error processing document ${doc.OcrId}:`, error);
                setBatchResults(prev => ({
                    ...prev,
                    [doc.OcrId]: {
                        error: true,
                        errorMessage: error.message,
                        processed: true,
                        timestamp: new Date()
                    }
                }));
            } finally {
                setBatchProcessing(prev => ({ ...prev, [doc.OcrId]: false }));
            }
        }
    };

    const getBestMatch = () => {
        if (!detailedMatches || detailedMatches.length === 0) return null;
        return detailedMatches.reduce((best, current) => {
            return (current.score > (best?.score || 0)) ? current : best;
        }, null);
    };

    // Add viewDetails function
    const viewDetails = (OcrId) => {
        const docResults = batchResults[OcrId];
        if (docResults) {
            setSelectedDetails({
                OcrId,
                results: docResults,
                document: selectedDocuments.find(doc => doc.OcrId === OcrId)
            });
            setShowDetailsModal(true);
        }
    };

    // Add Modal Component
    const DetailsModal = () => {
        if (!selectedDetails) return null;

        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
                    {/* Modal Header */}
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Match Details for {selectedDetails.document?.fileName || 'Document'}
                        </h3>
                        <button
                            onClick={() => setShowDetailsModal(false)}
                            className="text-gray-400 hover:text-gray-500"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Match Results */}
                    <div className="space-y-4">
                        {selectedDetails.results.matches?.map((match, index) => (
                            <div key={index} className="border rounded-lg p-4">
                                <div className="flex justify-between items-center mb-2">
                                    <h4 className="font-medium">
                                        Claim: {match.claim?.claimNumber || 'N/A'}
                                    </h4>
                                    <span className={`px-2 py-1 rounded-full text-sm ${
                                        match.score >= 75 ? 'bg-green-100 text-green-800' :
                                        match.score >= 50 ? 'bg-yellow-100 text-yellow-800' :
                                        'bg-red-100 text-red-800'
                                    }`}>
                                        Score: {match.score}%
                                    </span>
                                </div>

                                {/* Match Details */}
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <div>
                                        <h5 className="font-medium mb-2">Claim Details</h5>
                                        <ul className="space-y-1 text-sm">
                                            <li>Claimant: {match.claim?.name || 'N/A'}</li>
                                            <li>Date of Injury: {match.claim?.date || 'N/A'}</li>
                                            <li>Status: {match.claim?.status || 'N/A'}</li>
                                        </ul>
                                    </div>
                                    <div>
                                        <h5 className="font-medium mb-2">Matched Fields</h5>
                                        <ul className="space-y-1 text-sm">
                                            {match.matches?.matchedFields?.map((field, i) => (
                                                <li key={i} className="flex items-center">
                                                    <span className="w-4 h-4 mr-2">✓</span>
                                                    {field}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Add renderCheckedDocuments function
    const renderCheckedDocuments = () => {
        // Ensure selectedDocuments is an array before mapping
        if (!Array.isArray(selectedDocuments)) return null;

        return selectedDocuments.map((doc) => (
            <tr key={doc.OcrId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                {/* Document Name */}
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {doc.fileName}
                </td>

                {/* Match Score */}
                <td className="px-6 py-4">
                    <SingleDocumentProcessor 
                        document={doc}
                        matchResults={matchResults[doc.OcrId]}
                    />
                    <MatchScoreIndicator 
                        score={matchResults[doc.OcrId]?.topScore || 0}
                        matchDetails={matchResults[doc.OcrId]?.matchResults?.[0]}
                    />
                </td>

                {/* Match History & Sort Manager */}
                <td className="px-6 py-4">
                    <DocumentSortManager 
                        document={doc}
                        onSortComplete={(result) => {
                            setMatchResults(prev => ({
                                ...prev,
                                [doc.OcrId]: result
                            }));
                        }}
                    />
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        loading ? 'bg-yellow-100 text-yellow-800' :
                        error ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                        {loading ? 'Processing' : error ? 'Error' : 'Ready'}
                    </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => viewDetails(doc.OcrId)}
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                        Details
                    </button>
                </td>
            </tr>
        ));
    };

    // Update table header to include bulk sort
    const renderTableHeader = () => (
        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
            <tr>
                <th scope="col" className="px-6 py-3">Document</th>
                <th scope="col" className="px-6 py-3">Match Score</th>
                <th scope="col" className="px-6 py-3">Best Match</th>
                <th scope="col" className="px-6 py-3">Matched Fields</th>
                <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
        </thead>
    );

    // Add bulk sort handler
    const handleBulkSort = async () => {
        if (!selectedDocuments.length) return;
        
        try {
            const response = await fetch('http://localhost:4000/dms/bulk-sort', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    documentIds: selectedDocuments.map(doc => doc.OcrId),
                    autoSort: true,
                    minScore: 75
                }),
            });

            if (response.ok) {
                const result = await response.json();
                alert(`Successfully sorted ${result.success.length} documents`);
            } else {
                throw new Error('Failed to sort documents');
            }
        } catch (error) {
            console.error('Error in bulk sort:', error);
            alert('Failed to sort documents: ' + error.message);
        }
    };

    // Add renderSingleDocument function
    const renderSingleDocument = () => {
        if (!selectedDocument) return null;

        const bestMatch = getBestMatch();

        return (
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {selectedDocument.fileName || 'Unnamed Document'}
                </th>
                <td className="px-6 py-4">
                    <MatchScoreIndicator 
                        score={bestMatch?.score || 0}
                        matchDetails={{
                            isRecommended: bestMatch?.isRecommended || false,
                            matchedFields: bestMatch?.matches?.matchedFields || [],
                            confidence: bestMatch?.matches?.confidence || {},
                            claimNumber: bestMatch?.claim?.claimNumber || '',
                            claimantName: bestMatch?.claim?.name || '',
                            dateOfInjury: bestMatch?.claim?.date || '',
                            physicianName: bestMatch?.claim?.physicianName || ''
                        }}
                    />
                </td>
                <td className="px-6 py-4">
                    {bestMatch?.claim?.claimNumber || 'No match'}
                </td>
                <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                        loading ? 'bg-yellow-100 text-yellow-800' :
                        error ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                        {loading ? 'Processing' : error ? 'Error' : 'Ready'}
                    </span>
                </td>
                <td className="px-6 py-4 text-right">
                    <button 
                        onClick={() => viewDetails(selectedDocument.OcrId)}
                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    >
                        Details
                    </button>
                </td>
            </tr>
        );
    };

    const handleBatchProcess = async () => {
        if (!selectedDocuments.length || batchProcessing) return;

        try {
            setBatchProcessing(true);
            setBatchResults({
                processed: 0,
                total: selectedDocuments.length,
                success: [],
                failed: []
            });

            const response = await processBatch(
                selectedDocuments.map(doc => doc.OcrId)
            );

            setBatchId(response.batchId);
            startStatusPolling(response.batchId);

        } catch (error) {
            console.error('Batch processing error:', error);
            // Show error notification
        }
    };

    const startStatusPolling = (batchId) => {
        const pollInterval = setInterval(async () => {
            try {
                const response = await fetch(`http://localhost:4000/ai/batch-status/${batchId}`);
                const status = await response.json();

                setBatchResults({
                    processed: status.processed,
                    total: status.total,
                    success: status.success,
                    failed: status.failed
                });

                if (!status.inProgress) {
                    clearInterval(pollInterval);
                    setBatchProcessing(false);
                }
            } catch (error) {
                console.error('Status polling error:', error);
                clearInterval(pollInterval);
                setBatchProcessing(false);
            }
        }, 2000); // Poll every 2 seconds
    };

    const handleCancelBatch = async () => {
        // Implement cancel logic if needed
        setBatchProcessing(false);
    };

    const handleSortComplete = (OcrId, result) => {
        setMatchResults(prev => ({
            ...prev,
            [OcrId]: result
        }));
    };

    const handleProcessDocument = async (OcrId) => {
        if (batchProcessing[OcrId]) return;

        setBatchProcessing(prev => ({ ...prev, [OcrId]: true }));
        try {
            // Get document from selectedDocuments
            const documentData = selectedDocuments.find(doc => doc.OcrId === OcrId);
            
            if (!documentData) {
                throw new Error('Document data not found');
            }

            // Simplified document metadata
            const documentMetadata = {
                OcrId: documentData.OcrId,
                fileName: documentData.fileName,
                category: documentData.category
            };

            // First perform NER
            const nerResponse = await fetch('http://localhost:4000/ai/ner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    text: documentData.textContent,
                    OcrId
                })
            });

            if (!nerResponse.ok) throw new Error('NER processing failed');
            const { entities } = await nerResponse.json();

            // Then find matches
            const matchResults = await findMatches(entities);
            
            // Save match history with minimal metadata
            const historyResponse = await fetch('http://localhost:4000/ai/match-history', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    OcrId,
                    matchResults,
                    documentMetadata // Only sending minimal metadata
                })
            });

            if (!historyResponse.ok) {
                const errorData = await historyResponse.json();
                throw new Error(errorData.message || 'Failed to save match history');
            }

            // Fetch latest match history
            const latestHistoryResponse = await fetch(`http://localhost:4000/ai/match-history/${OcrId}`);
            const { matchHistory, bestMatch } = await latestHistoryResponse.json();
            
            setBatchResults(prev => ({
                ...prev,
                [OcrId]: {
                    matches: matchHistory || [],
                    topScore: bestMatch?.score || 0,
                    processed: true,
                    timestamp: new Date()
                }
            }));

        } catch (error) {
            console.error(`Error processing document ${OcrId}:`, error);
            setBatchResults(prev => ({
                ...prev,
                [OcrId]: {
                    error: true,
                    errorMessage: error.message,
                    processed: true,
                    timestamp: new Date()
                }
            }));
        } finally {
            setBatchProcessing(prev => ({ ...prev, [OcrId]: false }));
        }
    };

    const renderMatchResults = (docResults) => {
        if (!docResults?.matches?.length) {
            return (
                <div className="p-2 border rounded">
                    <div className="flex items-center justify-between">
                        <span className="text-gray-500">No matches found</span>
                        <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Match Score:</span>
                            <MatchScoreIndicator score={0} />
                            <span className="text-sm font-medium">0.0%</span>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="p-2 border rounded">
                <div className="flex justify-between items-center">
                    <span className="font-medium">
                        {docResults.matches[0]?.claim?.claimNumber || 'No Claim Number'}
                    </span>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Match Score:</span>
                        <MatchScoreIndicator score={docResults.topScore || 0} />
                        <span className="text-sm font-medium">
                            {(docResults.topScore || 0).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        );
    };

    const renderDocumentRow = (doc) => {
        const aiResults = aiMatchResults[doc.OcrId] || [];
        
        return (
            <tr key={doc.OcrId}>
                {/* ... other cells ... */}
                <td className="px-6 py-4">
                    <div className="space-y-2">
                        {aiResults.map((match, index) => (
                            <div key={index} className="border rounded-lg p-2">
                                <div className="flex justify-between items-center">
                                    <span className="font-medium">
                                        {match.claim.claimNumber}
                                    </span>
                                    <MatchScoreIndicator score={match.score} />
                                </div>
                                <div className="text-sm text-gray-600 mt-1">
                                    {match.matchDetails.matchedFields?.join(', ')}
                                </div>
                            </div>
                        ))}
                    </div>
                </td>
            </tr>
        );
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 relative overflow-hidden shadow-md sm:rounded-lg">
            {/* Header Section */}
            <div className="flex items-center justify-between p-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedDocuments.length > 0 ? 'Selected Documents' : 'Document Details'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {selectedDocuments.length > 0 
                            ? `${selectedDocuments.length} documents selected`
                            : 'Single document view'
                        }
                    </p>
                </div>
            </div>
            

            {/* Results Table */}
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    {renderTableHeader()}
                    <tbody>
                        {selectedDocuments.length > 0 
                            ? renderCheckedDocuments()
                            : renderSingleDocument()
                        }
                    </tbody>
                </table>
            </div>

            {/* Details Modal */}
            {showDetailsModal && <DetailsModal />}

            {/* Batch Processing Controls */}
            {selectedDocuments.length > 0 && (
                <div className="mb-4">
                    <button
                        onClick={handleBatchProcess}
                        disabled={batchProcessing}
                        className={`px-4 py-2 rounded-lg font-medium ${
                            batchProcessing 
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                        }`}
                    >
                        {batchProcessing ? 'Processing...' : 'Process Selected'}
                    </button>
                </div>
            )}

            {/* Batch Status */}
            {(batchProcessing || batchResults.processed > 0) && (
                <BatchProcessingStatus
                    batchResults={batchResults}
                    isProcessing={batchProcessing}
                    onCancel={handleCancelBatch}
                />
            )}

            {/* Sort Results Display */}
            {sortResults && (
                <div className="mb-4 p-3 bg-gray-50 rounded">
                    <h3 className="font-medium text-sm">Sort Results</h3>
                    <div className="text-sm text-gray-600">
                        Status: {sortResults.status}
                        {sortResults.targetClaim && (
                            <span className="ml-2">
                                → Claim: {sortResults.targetClaim.claimNumber}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default memo(SuggestedClaims);