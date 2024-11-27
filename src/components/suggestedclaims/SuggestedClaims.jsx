import React, { useEffect, useContext, useCallback, useState } from 'react';
import MatchScoreIndicator from './MatchScoreIndicator';
import { MatchContext } from '../matchcontext/MatchContext';

const SuggestedClaims = ({ selectedDocument }) => {
    const { 
        detailedMatches, 
        totalMatches, 
        topScore, 
        loading, 
        error, 
        findMatches,
        getMatchHistory,
        matchHistory,
        lastUpdated,
        saveMatchHistory
    } = useContext(MatchContext);

    useEffect(() => {
        if (selectedDocument?.OcrId) {
            getMatchHistory(selectedDocument.OcrId);
        }
    }, [selectedDocument, getMatchHistory]);

    const handleRefresh = useCallback(async () => {
        if (selectedDocument?.textContent) {
            await findMatches(selectedDocument.textContent);
        }
    }, [selectedDocument, findMatches]);

    useEffect(() => {
        if (lastUpdated) {
            console.log('Matches updated:', {
                totalMatches,
                topScore,
                matchesCount: detailedMatches?.length,
                timestamp: lastUpdated
            });
        }
    }, [lastUpdated, detailedMatches, totalMatches, topScore]);

    useEffect(() => {
        console.log('Document Analysis:', {
            document: selectedDocument,
            matchScores: detailedMatches?.map(match => ({
                claimNumber: match.claim?.claimNumber,
                score: match.score,
                matchedFields: match.matches?.matchedFields
            })),
            totalMatches,
            topScore
        });
    }, [selectedDocument, detailedMatches, totalMatches, topScore]);

    useEffect(() => {
        console.log('Document Analysis Debug:', {
            document: {
                id: selectedDocument?.OcrId,
                fileName: selectedDocument?.fileName
            },
            matches: detailedMatches?.map(match => ({
                claimNumber: match.claim?.claimNumber, // Updated to match backend structure
                claimantName: match.claim?.name,
                matchScore: match.score || 0,
                matchedFields: match.matches?.matchedFields || [] // Added for debugging
            })) || []
        });
    }, [selectedDocument, detailedMatches]);

    const isValidDocument = selectedDocument && selectedDocument.OcrId;

    const formatDate = (dateString) => {
        try {
            return new Date(dateString).toLocaleDateString();
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Invalid Date';
        }
    };

    const handleSort = (claimId) => {
        console.log('Sorting document:', selectedDocument?.OcrId, 'to claim:', claimId);
        // Add sorting logic here
    };

    const getBestMatch = () => {
        if (!detailedMatches || detailedMatches.length === 0) return null;
        
        return detailedMatches.reduce((best, current) => {
            return (current.score > (best?.score || 0)) ? current : best;
        }, null);
    };

    const renderMatchDetails = (match) => {
        return (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">
                        Match Score: {match.score}%
                    </div>
                    <div className="text-sm">
                        {match.matches.matchedFields.length} fields matched
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                    {Object.entries(match.matches.details).map(([field, detail]) => (
                        <div key={field} 
                            className={`p-2 rounded ${
                                detail.matched 
                                    ? 'bg-green-50 text-green-700' 
                                    : 'bg-gray-50 text-gray-500'
                            }`}
                        >
                            <div className="text-sm font-medium capitalize">
                                {field.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            <div className="text-xs">
                                Score: {detail.score} pts
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const getSuggestedClaims = () => {
        if (!detailedMatches?.length) return 'No matches found';
        
        return (
            <div className="space-y-4">
                {detailedMatches.map((match, index) => (
                    <div key={index} className="border-b last:border-b-0 pb-4">
                        <div className="flex justify-between items-center mb-2">
                            <div className="space-y-1">
                                <div className="font-medium">
                                    Claim: {match.claim.claimNumber}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {match.claim.name} - {match.claim.employerName}
                                </div>
                            </div>
                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded text-xs ${
                                    match.isRecommended 
                                        ? 'bg-green-100 text-green-800' 
                                        : 'bg-gray-100 text-gray-800'
                                }`}>
                                    {match.isRecommended ? 'Recommended' : 'Not Recommended'}
                                </span>
                            </div>
                        </div>
                        {renderMatchDetails(match)}
                    </div>
                ))}
            </div>
        );
    };

    const renderLoadingState = () => (
        <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
        </div>
    );

    const renderMatchesCell = () => {
        if (loading) {
            return (
                <td className="px-6 py-4">
                    {renderLoadingState()}
                </td>
            );
        }

        if (error) {
            return (
                <td className="px-6 py-4">
                    <div className="text-red-500">Error: {error}</div>
                </td>
            );
        }

        return (
            <td className="px-6 py-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">Total Matches: {totalMatches}</span>
                    <span className="font-medium">Top Score: {topScore}%</span>
                </div>
                {getSuggestedClaims()}
            </td>
        );
    };

    // Add a debug panel during development
    const renderDebugInfo = () => (
        <div className="text-xs text-gray-500 mt-2">
            <div>Loading: {loading ? 'Yes' : 'No'}</div>
            <div>Total Matches: {totalMatches}</div>
            <div>Top Score: {topScore}</div>
            <div>Matches Array Length: {detailedMatches?.length}</div>
            <div>Last Updated: {
                lastUpdated 
                    ? new Date(lastUpdated).toLocaleTimeString() 
                    : 'Never'
            }</div>
        </div>
    );

    // Add refresh button to your UI
    const renderRefreshButton = () => (
        <button
            onClick={handleRefresh}
            disabled={loading}
            className="ml-2 p-2 text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
        </button>
    );

    const renderMatchHistory = () => (
        <div className="mt-4">
            <h3 className="text-lg font-semibold">Match History</h3>
            {matchHistory.map((match, index) => (
                <div key={index} className="border-b p-2">
                    <div className="flex justify-between">
                        <span>Score: {match.score}%</span>
                        <span>{new Date(match.matchedAt).toLocaleString()}</span>
                    </div>
                    <div className="text-sm">
                        Matched Fields: {match.matchedFields.join(', ')}
                    </div>
                </div>
            ))}
        </div>
    );

    const handleManualSave = async () => {
        if (selectedDocument?.OcrId && detailedMatches.length > 0) {
            const matchResults = {
                matches: detailedMatches,
                timestamp: new Date().toISOString(),
                topScore: topScore,
                recommendedMatches: detailedMatches
                    .filter(match => match.score >= 75)
                    .map(match => ({
                        score: match.score,
                        matchedFields: match.matchedFields || [],
                        confidence: match.confidence || {},
                        matchDetails: match.matches?.details || {},
                        isRecommended: true,
                        claimId: match.claimId,
                        claimNumber: match.claimNumber
                    }))
            };
            await saveMatchHistory(selectedDocument.OcrId, matchResults);
        }
    };

    // Add this button near the refresh button
    const renderSaveButton = () => (
        <button
            onClick={handleManualSave}
            disabled={loading || !detailedMatches.length}
            className="ml-2 p-2 text-green-600 hover:text-green-800 disabled:text-gray-400"
        >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
        </button>
    );

    return (
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 md:p-12 mb-8">
            <a href="#" className="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-blue-400 mb-2">
                MATCHES
            </a>
            <h1 className="text-gray-900 dark:text-white text-3xl md:text-5xl font-extrabold mb-2">
                Potential Claim Matches
            </h1>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Document Title</th>
                            <th scope="col" className="px-6 py-3">Match Score</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Suggested Claim(s)</th>
                            <th scope="col" className="px-6 py-3"><span className="sr-only">Sort</span></th>
                        </tr>
                    </thead>
                    <tbody>
                        {isValidDocument ? (
                            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                    <div>
                                        <div>{selectedDocument.fileName}</div>
                                        <div className="text-xs text-gray-500">ID: {selectedDocument.OcrId}</div>
                                        <div className="text-xs text-gray-500">
                                            Uploaded: {formatDate(selectedDocument.uploadDate)}
                                        </div>
                                    </div>
                                </th>
                                <MatchScoreIndicator 
                                    score={getBestMatch()?.score || 0}
                                    matchDetails={{
                                        isRecommended: getBestMatch()?.isRecommended || false,
                                        claimNumber: getBestMatch()?.claimNumber,
                                        matchedFields: getBestMatch()?.matchedFields || [],
                                        totalScore: getBestMatch()?.score || 0,
                                        claimantName: getBestMatch()?.claimantName,
                                        dateOfInjury: getBestMatch()?.dateOfInjury,
                                        matchDetails: getBestMatch()?.matches?.details || {}
                                    }}
                                />
                                <td className="px-6 py-4">
                                    {selectedDocument.category || 'Unspecified'}
                                </td>
                                {renderMatchesCell()}
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleSort(selectedDocument.OcrId)}
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                        disabled={!detailedMatches?.length}
                                    >
                                        Sort
                                    </button>
                                </td>
                            </tr>
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center">
                                    No document selected
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            {process.env.NODE_ENV === 'development' && renderDebugInfo()}
            {renderRefreshButton()}
            {renderSaveButton()}
            {renderMatchHistory()}
        </div>
    );
};

export default SuggestedClaims;