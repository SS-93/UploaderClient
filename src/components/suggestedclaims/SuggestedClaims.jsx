import React, { useEffect, useContext, useCallback, useState, memo } from 'react';
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
    }, [selectedDocument?.OcrId]);

    const handleRefresh = useCallback(async () => {
        if (selectedDocument?.entities) {
            await findMatches(selectedDocument.entities);
        }
    }, [selectedDocument, findMatches]);

    const getBestMatch = () => {
        if (!detailedMatches || detailedMatches.length === 0) return null;
        return detailedMatches.reduce((best, current) => {
            return (current.score > (best?.score || 0)) ? current : best;
        }, null);
    };

    const isValidDocument = selectedDocument && selectedDocument.OcrId;

    return (
        <div className="bg-gray-50 dark:bg-gray-800 relative overflow-hidden shadow-md sm:rounded-lg">
            <div className="flex items-center justify-between p-4">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Suggested Claims
                    </h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Match results for selected document
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    Refresh Matches
                </button>
            </div>

            <div className="relative overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                            <th scope="col" className="px-6 py-3">Document</th>
                            <th scope="col" className="px-6 py-3">Match Score</th>
                            <th scope="col" className="px-6 py-3">Category</th>
                            <th scope="col" className="px-6 py-3">Status</th>
                            <th scope="col" className="px-6 py-3">
                                <span className="sr-only">Actions</span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {isValidDocument ? (
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

            {matchHistory.length > 0 && (
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
        </div>
    );
};

export default memo(SuggestedClaims);