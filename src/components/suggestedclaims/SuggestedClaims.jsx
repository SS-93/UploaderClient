import React, { useEffect } from 'react';

const MatchScoreIndicator = ({ score }) => {
    return (
        <td className="px-6 py-4">
            <div className="flex items-center">
                <div className="h-2.5 w-full bg-gray-200 rounded dark:bg-gray-700">
                    <div 
                        className={`h-2.5 rounded ${
                            score >= 75 ? 'bg-green-500' :
                            score >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                        }`}
                        style={{ width: `${score}%` }}
                    ></div>
                </div>
                <span className="ml-2">{score}%</span>
            </div>
        </td>
    );
};

const SuggestedClaims = ({ selectedDocument, matchResults }) => {
    console.log('SuggestedClaims - Document:', selectedDocument);
    console.log('Match Results:', matchResults);

    useEffect(() => {
        console.log('Document Analysis:', {
            document: selectedDocument,
            matchScores: matchResults?.map(match => ({
                claimNumber: match.claimNumber,
                score: match.score,
                matchedFields: match.matches?.matchedFields
            }))
        });
    }, [selectedDocument, matchResults]);

    useEffect(() => {
        console.log('Document Analysis Debug:', {
            document: {
                id: selectedDocument?.OcrId,
                fileName: selectedDocument?.fileName
            },
            matches: matchResults?.map(match => ({
                claimNumber: match.claimNumber,
                claimantName: match.claim?.name,
                matchScore: match.score || 0
            })) || []
        });
    }, [selectedDocument, matchResults]);

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
        if (!matchResults || matchResults.length === 0) {
            console.log('No match results available');
            return 0;
        }
        const bestScore = Math.max(...matchResults.map(match => match.score || 0));
        console.log('Best match score:', bestScore);
        return bestScore;
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
                                <td className="px-6 py-4">
                                    {matchResults?.length > 0 
                                        ? matchResults.map(match => match.claimNumber).join(', ')
                                        : 'No matches found'
                                    }
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleSort(selectedDocument.OcrId)}
                                        className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                                        disabled={!matchResults?.length}
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