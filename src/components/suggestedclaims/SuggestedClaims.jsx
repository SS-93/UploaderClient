import React, { useEffect, useContext, useCallback, useState, memo, useMemo } from 'react';
import MatchScoreIndicator from './MatchScoreIndicator';
import { MatchContext } from '../matchcontext/MatchContext';
import BatchProcessingStatus from './BatchProcessingStatus';
import DocumentSortManager from '../documentsort/DocumentSortManager';
import MatchHistoryCell from './MatchHistoryCell';
import SingleDocumentProcessor from '../singledocumentprocessor/SingleDocumentProcessor';
import BulkSortManager from '../bulksort/BulkSortManager';
import MatchDetails from '../claimquerymatrix/MatchDetails';
import matchDisplayUtils from '../../utils/matchDisplayUtils';
import MatchHistoryViewer from '../matchhistoryviewer/MatchHistoryViewer';

const SuggestedClaims = ({ 
    selectedDocument, 
    selectedDocuments = [], 
    processingEnabled, 
    documentMatchResults,
    bulkSortStatus,
    onBulkSortComplete, 
    aiMatchResults,
    sortResults,
    onProcess
}) => {
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

    const [matchResults, setMatchResults] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [viewingHistory, setViewingHistory] = useState(null);


    const handleDocumentSelect = async (document) => {
        console.log('📄 Document selected:', document);
        
        if (!document?.OcrId) {
            console.warn('⚠️ Selected document has no OcrId');
            return;
        }

        setIsProcessing(true);
        try {
            // First get the OCR text
            console.log('🔍 Fetching OCR text for document:', document.OcrId);
            const ocrResponse = await fetch(`http://localhost:4000/dms/ocr-text/${document.OcrId}`);
            
            if (!ocrResponse.ok) {
                throw new Error('Failed to fetch OCR text');
            }
            
            const ocrData = await ocrResponse.json();
            console.log('📝 Received OCR text:', ocrData);

            // Then get match history
            console.log('🔄 Fetching match history');
            const matchResponse = await fetch(`http://localhost:4000/ai/match-history/${document.OcrId}`);
            
            if (!matchResponse.ok) {
                throw new Error('Failed to fetch match history');
            }
            
            const matchData = await matchResponse.json();
            console.log('📊 Received match data:', matchData);

            // Format match results
            const formattedResults = {
                topScore: matchData.topScore,
                totalMatches: matchData.totalMatches,
                matchResults: matchData.matchResults?.map(match => ({
                    score: match.score,
                    matchedFields: match.matches?.matchedFields || [],
                    confidence: match.matches?.confidence || {},
                    matchDetails: {
                        claimNumber: match.claim?.claimNumber,
                        claimantName: match.claim?.name,
                        physicianName: match.claim?.physicianName,
                        dateOfInjury: match.claim?.dateOfInjury,
                        employerName: match.claim?.employerName
                    },
                    isRecommended: match.isRecommended
                }))
            };

            console.log('✨ Formatted match results:', formattedResults);
            setMatchResults(formattedResults);

        } catch (error) {
            console.error('❌ Error processing document:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        if (selectedDocument) {
            console.log('🔄 Selected document changed:', selectedDocument);
            handleDocumentSelect(selectedDocument);
        }
    }, [selectedDocument]);

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
    const [processing, setProcessing] = useState(false);
    const [sortStatus, setSortStatus] = useState('pending');
    const [bulkSortDocuments, setBulkSortDocuments] = useState([]);

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
        // Check if we have match results
        if (!documentMatchResults || !selectedDocument?.OcrId) return null;
        
        // Get matches for current document
        const currentDocumentMatches = documentMatchResults[selectedDocument.OcrId];
        
        if (!currentDocumentMatches?.matchResults?.length) {
            return null;
        }
        
        // Return the first match (should be best match)
        return currentDocumentMatches.matchResults[0] || {
            score: 0,
            matchedFields: [],
            confidence: {},
            claim: null,
            isRecommended: false
        };
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
                                        match.score >= 70 ? 'bg-green-100 text-green-800' :
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
        return selectedDocuments.map((doc, index) => (
            <tr key={doc.OcrId || index} className="border-t">
                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                    {doc.fileName}
                </td>
                
                <td className="px-4 py-4">
                    <div className="space-y-2">
                        {/* Score Progress Bar */}
                        <div className="flex items-center space-x-2">
                            <div className="h-2 flex-grow bg-gray-200 rounded">
                                <div 
                                    className={`h-2 rounded ${
                                        doc?.matchHistory?.[0]?.score >= 70 ? 'bg-green-500' :
                                        doc?.matchHistory?.[0]?.score >= 45 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${doc?.matchHistory?.[0]?.score || 0}%` }}
                                ></div>
                            </div>
                            <span className="text-sm font-medium">
                                {doc?.matchHistory?.[0]?.score?.toFixed(2) || 0}%
                            </span>
                        </div>
                        
                        {/* Claim Details */}
                        {doc?.matchHistory?.[0]?.matchDetails && (
                            <div className="space-y-1">
                                <div className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                    Claim: {doc.matchHistory[0].matchDetails.claimNumber}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Claimant: {doc.matchHistory[0].matchDetails.claimantName}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Physician: {doc.matchHistory[0].matchDetails.physicianName}
                                </div>
                            </div>
                        )}
                    </div>
                </td>
                
                <td className="px-4 py-4">
                    <div className="text-sm">
                        {doc?.matchHistory?.[0]?.matchDetails?.claimNumber || 'No match'}
                    </div>
                </td>
                
                <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                        doc?.matchHistory?.[0]?.score >= 70 ? 'bg-green-100 text-green-800' :
                        doc?.matchHistory?.[0]?.score >= 45 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>
                        {loading ? 'Loading...' : error ? 'Error' : 'Ready'}
                    </span>
                </td>
                
                <td className="px-4 py-4 space-x-2 flex items-center">
                    
                    
                    {/* <SingleDocumentProcessor
                        document={doc}
                        onBulkSortComplete={onBulkSortComplete}
                        aiMatchResults={aiMatchResults}
                        matchResults={documentMatchResults[doc.OcrId] || {}}
                        // onProcessComplete={(ocrId, results) => {
                        //     setDocumentMatchResults(prev => ({
                        //         ...prev,
                        //         [ocrId]: results
                        //     }));
                        // }}
                        sortResults={sortResults}
                        onProcess={onProcess}
                    /> */}

                    {/* Add DocumentSortManager here */}
                    <DocumentSortManager 
                        document={doc}
                        documents={selectedDocuments}
                        documentMatchResults={documentMatchResults}
                        onSortComplete={(result) => {
                            setMatchResults(prev => ({
                                ...prev,
                                [doc.OcrId]: result
                            }));
                        }}
                        onBulkSortComplete={(results) => {
                            results.successful.forEach(result => {
                                setMatchResults(prev => ({
                                    ...prev,
                                    [result.OcrId]: result
                                }));
                            });
                        }}
                    />
                     <div className="flex flex-col items-center space-y-2">
        <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => setViewingHistory(viewingHistory === doc.OcrId ? null : doc.OcrId)}
        >
            {viewingHistory === doc.OcrId ? 'Hide Details' : 'Show Details'}
        </button>
        
        {viewingHistory === doc.OcrId && (
            <MatchHistoryViewer 
                document={doc}
                matchHistory={doc.matchHistory}
            />
        )}
    </div>
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
                <th scope="col" className="px-6 py-3 relative flex items-center justify-between">
    <span>Actions</span>
    <button 
        onClick={() => window.location.reload()}
        className="p-1.5 rounded-full hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center ml-2"
        title="Refresh"
    >
        <svg 
            className="w-4 h-4 text-gray-600" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
        >
            <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
        </svg>
    </button>
</th>
            </tr>
        </thead>
    );

    // Add bulk sort handler
    const handleBulkSort = async () => {
        if (!selectedDocuments.length) return;

        try {
            const documentsToSort = selectedDocuments
                .filter(doc => documentMatchResults[doc.OcrId]?.matchHistory?.[0])
                .map(doc => {
                    const matchHistory = documentMatchResults[doc.OcrId].matchHistory;
                    const bestMatch = matchHistory[0];
                    return {
                        OcrId: doc.OcrId,
                        claimId: bestMatch.matchDetails?.claimId,
                        matchScore: bestMatch.score
                    };
                });

            if (!documentsToSort.length) {
                console.warn('No documents with valid matches to sort');
                return;
            }

            console.log('Preparing to sort documents:', documentsToSort);

            const response = await fetch(
                'http://localhost:4000/dms/sort-documents',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ documents: documentsToSort })
                }
            );

            if (!response.ok) {
                throw new Error('Bulk sort operation failed');
            }

            const results = await response.json();
            console.log('Bulk sort completed:', results);
            onBulkSortComplete?.(results);

        } catch (error) {
            console.error('Bulk Sort Error:', error);
        }
    };

    // Add renderSingleDocument function
    const renderSingleDocument = () => {
        if (!selectedDocument) return null;

        // Log the match history to debug
        console.log('Match History:', selectedDocument.matchHistory);

        const bestMatch = getBestMatch();
        
        const matchData = documentMatchResults[selectedDocument.OcrId];
        
        return (
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4">
                    <h2 className="text-xl font-semibold mb-2">Document Details</h2>
                    <p className="text-sm text-gray-600 mb-4">Single document view</p>
                    
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">DOCUMENT</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">MATCH SCORE</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">BEST MATCH</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">STATUS</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                    {selectedDocument.fileName}
                                </td>
                                
                                <td className="px-4 py-4">
                                    <div className="space-y-2">
                                        {/* Score Progress Bar */}
                                        <div className="flex items-center space-x-2">
                                            <div className="h-2 flex-grow bg-gray-200 rounded">
                                                <div 
                                                    className={`h-2 rounded ${
                                                        selectedDocument?.matchHistory?.[0]?.score >= 60 ? 'bg-green-500' :
                                                        selectedDocument?.matchHistory?.[0]?.score >= 45 ? 'bg-yellow-500' :
                                                        'bg-red-500'
                                                    }`}
                                                    style={{ width: `${selectedDocument?.matchHistory?.[0]?.score || 0}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium">
                                                {selectedDocument?.matchHistory?.[0]?.score?.toFixed(2) || 0}%
                                            </span>
                                        </div>
                                        
                                        {/* Claim Details */}
                                        {selectedDocument?.matchHistory?.[0]?.matchDetails && (
                                            <div className="space-y-1">
                                                <div className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                                    Claim: {selectedDocument.matchHistory[0].matchDetails.claimNumber}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Claimant: {selectedDocument.matchHistory[0].matchDetails.claimantName}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    Physician: {selectedDocument.matchHistory[0].matchDetails.physicianName}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </td>
                                
                                <td className="px-4 py-4 text-center align-middle">
    <div className="text-sm">
        {selectedDocument?.matchHistory?.[0]?.matchDetails?.claimNumber || 'No match'}
    </div>
</td>
                                
                                <td className="px-4 py-4">
                                    <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        Ready
                                    </span>
                                </td>
                                
                                <td className="px-4 py-4 space-x-2 flex items-center">
                                   
{/*                                     
                                    <SingleDocumentProcessor
                                        document={selectedDocument}
                                        onBulkSortComplete={onBulkSortComplete}
                                        aiMatchResults={aiMatchResults}
                                        matchResults={documentMatchResults[selectedDocument.OcrId] || {}}
                                        // onProcessComplete={(ocrId, results) => {
                                        //     setDocumentMatchResults(prev => ({
                                        //         ...prev,
                                        //         [ocrId]: results
                                        //     }));
                                        // }}
                                        sortResults={sortResults}
                                        onProcess={onProcess}
                                    /> */}

                                    {/* Add DocumentSortManager here */}
                                    <DocumentSortManager 
                                        document={selectedDocument}
                                        documents={selectedDocuments}
                                        documentMatchResults={documentMatchResults}
                                        onSortComplete={(result) => {
                                            setMatchResults(prev => ({
                                                ...prev,
                                                [selectedDocument.OcrId]: result
                                            }));
                                        }}
                                        onBulkSortComplete={(results) => {
                                            results.successful.forEach(result => {
                                                setMatchResults(prev => ({
                                                    ...prev,
                                                    [result.OcrId]: result
                                                }));
                                            });
                                        }}
                                    />
<div className="flex flex-col items-center space-y-2">
        <button 
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            onClick={() => setViewingHistory(viewingHistory === selectedDocument.OcrId ? null : selectedDocument.OcrId)}
        >
            {viewingHistory === selectedDocument.OcrId ? 'Hide Details' : 'Show Details'}
        </button>
        
        {viewingHistory === selectedDocument.OcrId && (
            <MatchHistoryViewer 
                document={selectedDocument}
                matchHistory={selectedDocument.matchHistory}
            />
        )}
    </div>
                                </td>
                                
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
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

    // const handleSortComplete = (OcrId, result) => {
    //     setMatchResults(prev => ({
    //         ...prev,
    //         [OcrId]: result
    //     }));
    // };

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

    const renderMatchResults = (matchResults) => {
        if (!matchResults || matchResults.length === 0) {
            return (
                <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                        No matches found
                    </td>
                </tr>
            );
        }

        return matchResults.map((match, index) => (
            <tr key={index} className={match.isRecommended ? 'bg-green-50' : ''}>
                <td className="px-6 py-4">
                    <MatchScoreIndicator 
                        score={match.score}
                        matchDetails={{
                            matchedFields: match.matchedFields,
                            confidence: match.confidence,
                            isRecommended: match.isRecommended
                        }}
                    />
                </td>
                <td className="px-6 py-4">{match.claim.claimNumber}</td>
                <td className="px-6 py-4">{match.claim.name}</td>
                <td className="px-6 py-4">{match.claim.employerName}</td>
                <td className="px-6 py-4">{match.claim.dateOfInjury}</td>
            </tr>
        ));
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

    const [localMatchResults, setLocalMatchResults] = useState({});

    // Combine passed match results with local ones
    const combinedMatchResults = useMemo(() => ({
        ...documentMatchResults,
        ...localMatchResults
    }), [documentMatchResults, localMatchResults]);

    const handleSortComplete = (OcrId, result) => {
        setLocalMatchResults(prev => ({
            ...prev,
            [OcrId]: result
        }));
    };

    return (
        <div className="bg-gray-50 dark:bg-gray-800 relative overflow-hidden shadow-md sm:rounded-lg">
            {/* Header Section */}
            <div className="flex items-center justify-between p-4">
                <div className="flex items-center space-x-4">
                    {/* <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedDocuments.length > 0 ? 'Selected Documents' : 'Document Details'}
                    </h2> */}
                    {/* {selectedDocuments.length > 0 && (
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
                    )} */}

<BulkSortManager 
                selectedDocuments={selectedDocuments}
                documentMatchResults={combinedMatchResults}
                onBulkSortComplete={onBulkSortComplete}
            />
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