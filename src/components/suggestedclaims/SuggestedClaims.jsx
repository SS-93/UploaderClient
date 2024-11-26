import React, { useEffect, useContext } from 'react';
import MatchScoreIndicator from './MatchScoreIndicator';
import { MatchContext } from '../matchcontext/MatchContext';

const SuggestedClaims = ({ selectedDocument }) => {
    const { matches, totalMatches, topScore, loading, error } = useContext(MatchContext);

    useEffect(() => {
        console.log('Document Analysis:', {
            document: selectedDocument,
            matchScores: matches?.map(match => ({
                claimNumber: match.claim?.claimNumber,
                score: match.score,
                matchedFields: match.matches?.matchedFields
            })),
            totalMatches,
            topScore
        });
    }, [selectedDocument, matches, totalMatches, topScore]);

    useEffect(() => {
        console.log('Document Analysis Debug:', {
            document: {
                id: selectedDocument?.OcrId,
                fileName: selectedDocument?.fileName
            },
            matches: matches?.map(match => ({
                claimNumber: match.claim?.claimNumber, // Updated to match backend structure
                claimantName: match.claim?.name,
                matchScore: match.score || 0,
                matchedFields: match.matches?.matchedFields || [] // Added for debugging
            })) || []
        });
    }, [selectedDocument, matches]);

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

    const getBestMatchScore = () => {
        if (!matches || matches.length === 0) {
            console.log('No match results available');
            return 0;
        }
        const bestScore = Math.max(...matches.map(match => match.score || 0));
        console.log('Best match score:', bestScore);
        return bestScore;
    };

    const renderMatchDetails = (match) => {
        return (
            <div className="space-y-2">
                {/* Summary Row */}
                <div className="flex justify-between text-sm">
                    <span>Match Score: {match.score}%</span>
                    <span>{match.matches.matchedFields.length} fields matched</span>
                </div>
                
                {/* Matched Fields Grid */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(match.matches.details).map(([field, detail]) => (
                        <div 
                            key={field}
                            className={`p-2 rounded ${
                                detail.matched 
                                    ? 'bg-green-100 dark:bg-green-800' 
                                    : 'bg-gray-100 dark:bg-gray-700'
                            }`}
                        >
                            <div className="flex justify-between">
                                <span className="capitalize">{field.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <span>{detail.score} pts</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Claim Details */}
                <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <h4 className="font-medium mb-1">Claim Details:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        {Object.entries(match.claim).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}:</span>
                                <span>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    const getSuggestedClaims = () => {
        if (!matches?.length) return 'No matches found';
        
        return (
            <div className="space-y-4">
                {matches.map((match, index) => (
                    <div key={index} className="border-b last:border-b-0 pb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">
                                Claim: {match.claim.claimNumber}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs ${
                                match.isRecommended 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-gray-100 text-gray-800'
                            }`}>
                                {match.isRecommended ? 'Recommended' : 'Not Recommended'}
                            </span>
                        </div>
                        {renderMatchDetails(match)}
                    </div>
                ))}
            </div>
        );
    };

    const renderMatchesCell = () => {
        if (loading) {
            return (
                <td className="px-6 py-4">
                    <div className="animate-pulse">Loading matches...</div>
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
                                <MatchScoreIndicator score={getBestMatchScore()} />
                                <td className="px-6 py-4">
                                    {selectedDocument.category || 'Unspecified'}
                                </td>
                                {renderMatchesCell()}
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleSort(selectedDocument.OcrId)}
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                        disabled={!matches?.length}
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
        </div>
    );
};

export default SuggestedClaims;