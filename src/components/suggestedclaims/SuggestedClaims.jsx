import React, { useEffect, useContext, useCallback, useState, memo } from 'react';
import MatchScoreIndicator from './MatchScoreIndicator';
import { MatchContext } from '../matchcontext/MatchContext';

const SuggestedClaims = ({ selectedDocument, selectedDocuments = [], processingEnabled }) => {
    const { 
        detailedMatches, 
        loading, 
        error, 
        findMatches,
        getMatchHistory,
        matchHistory,
        lastUpdated,                
        saveMatchHistory
    } = useContext(MatchContext);

    // Add states for batch processing
    const [batchProcessing, setBatchProcessing] = useState({});
    const [batchResults, setBatchResults] = useState({});

    // Add new state for details modal
    const [selectedDetails, setSelectedDetails] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    // Handle single document selection (maintain existing functionality)
    useEffect(() => {
        if (selectedDocument?.OcrId) {
            getMatchHistory(selectedDocument.OcrId);
        }
    }, [selectedDocument?.OcrId]);

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

    return (
        <div className="bg-gray-50 dark:bg-gray-800 relative overflow-hidden shadow-md sm:rounded-lg">
            {/* Header Section */}
            <div className="flex items-center justify-between p-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedDocuments.length > 0 ? 'Batch Processing Results' : 'Suggested Claims'}
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {selectedDocuments.length > 0 
                            ? `Processing ${selectedDocuments.length} documents`
                            : 'Match results for selected document'
                        }
                    </p>
                </div>
                {selectedDocuments.length > 0 && processingEnabled && (
                    <button
                        onClick={() => processBatchDocuments(selectedDocuments)}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                        disabled={Object.values(batchProcessing).some(Boolean)}
                    >
                        {Object.values(batchProcessing).some(Boolean) 
                            ? 'Processing...' 
                            : 'Process All'
                        }
                    </button>
                )}
            </div>

            {/* Results Table */}
            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Document</th>
                            <th scope="col" className="px-6 py-3">Match Score</th>
                            <th scope="col" className="px-6 py-3">Best Match</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* Single Document View */}
                        {selectedDocument && !selectedDocuments.length && (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {selectedDocument.fileName || 'Unnamed Document'}
                                </th>
                                <MatchScoreIndicator 
                                    score={getBestMatch()?.score || 0}
                                    matchDetails={{
                                        isRecommended: getBestMatch()?.isRecommended || false,
                                        matchedFields: getBestMatch()?.matches?.matchedFields || [],
                                        confidence: getBestMatch()?.matches?.confidence || {},
                                        claimNumber: getBestMatch()?.claim?.claimNumber || '',
                                        claimantName: getBestMatch()?.claim?.name || '',
                                        dateOfInjury: getBestMatch()?.claim?.date || '',
                                        physicianName: getBestMatch()?.matches?.details?.physicianName || ''
                                    }}
                                />
                                <td className="px-6 py-4">
                                    {selectedDocument.category || 'Unspecified'}
                                </td>
                                <td className="px-6 py-4">
                                    {loading ? (
                                        <span className="text-yellow-500">Processing...</span>
                                    ) : error ? (
                                        <span className="text-red-500">Error</span>
                                    ) : (
                                        <span className="text-green-500">Ready</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">
                                        Details
                                    </button>
                                </td>
                            </tr>
                        )}

                        {/* Batch Processing View */}
                        {selectedDocuments.map(doc => (
                            <tr key={doc.OcrId} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                    {doc.fileName || 'Unnamed Document'}
                                </td>
                                <td className="px-6 py-4">
                                    {batchResults[doc.OcrId]?.topScore 
                                        ? <MatchScoreIndicator 
                                            score={batchResults[doc.OcrId].topScore}
                                            matchDetails={batchResults[doc.OcrId].matches[0] || {}}
                                          />
                                        : '-'
                                    }
                                </td>
                                <td className="px-6 py-4">
                                    {batchResults[doc.OcrId]?.matches?.[0]?.claim?.claimNumber || 'No match'}
                                </td>
                                <td className="px-6 py-4">
                                    {batchProcessing[doc.OcrId] ? (
                                        <span className="text-yellow-500">Processing...</span>
                                    ) : batchResults[doc.OcrId]?.error ? (
                                        <span className="text-red-500">Error</span>
                                    ) : batchResults[doc.OcrId]?.processed ? (
                                        <span className="text-green-500">Complete</span>
                                    ) : (
                                        <span className="text-gray-500">Pending</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <button 
                                        onClick={() => viewDetails(doc.OcrId)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        View Details
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Match History Section - Show only for single document */}
            {selectedDocument && !selectedDocuments.length && matchHistory.length > 0 && (
                <div className="mt-4 p-4">
                    <h3 className="text-lg font-semibold mb-2">Match History</h3>
                    <div className="space-y-2">
                        {matchHistory.map((match, index) => (
                            <div key={index} className="p-2 bg-white rounded shadow">
                                <p>Score: {match.score}%</p>
                                <p>Date: {new Date(match.matchDate).toLocaleDateString()}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && (
                <DetailsModal />
            )}
        </div>
    );
};

export default memo(SuggestedClaims);