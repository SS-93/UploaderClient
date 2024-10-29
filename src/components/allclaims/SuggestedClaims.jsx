import React, { useState, useEffect } from 'react';

const SuggestedClaims = ({ selectedDocument, indexedClaims }) => {
    const [matchedClaims, setMatchedClaims] = useState([]);

    // useEffect(() => {
    //     if (selectedDocument && indexedClaims) {
    //         // Get matches from indexer
    //         const matches = indexedClaims
    //             .filter(claim => calculateMatchScore(selectedDocument, claim) >= 25)
    //             .sort((a, b) => calculateMatchScore(selectedDocument, b) - calculateMatchScore(selectedDocument, a));
    //         setMatchedClaims(matches);
    //     }
    // }, [selectedDocument, indexedClaims]);

    const documentTitle = selectedDocument?.fileName || 'No document selected';
    const documentCategory = selectedDocument?.category || 'Uncategorized';

    // Scoring component with the visual indicator
    const MatchScoreIndicator = ({ score }) => (
        <td className="px-6 py-4">
            <div className="relative w-full h-2 bg-gray-200 rounded">
                <div 
                    className={`absolute h-full rounded ${
                        score >= 75 ? 'bg-green-500' :
                        score >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                />
            </div>
            <span className="text-sm mt-1">{score}%</span>
        </td>
    );

    return (
        <div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">
                    Document Title
                </th>
                <th scope="col" className="px-6 py-3">
                    Match Score
                </th>
                <th scope="col" className="px-6 py-3">
                    Category
                </th>
                <th scope="col" className="px-6 py-3">
                    Suggested Claim(s)
                </th>
                <th scope="col" className="px-6 py-3">
                    <span className="sr-only">Sort</span>
                </th>
            </tr>
        </thead>
        <tbody>
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    {documentTitle}
                </th>
                <MatchScoreIndicator score={75} />
                <td className="px-6 py-4">
                    {documentCategory}
                </td>
                <td className="px-6 py-4">
                    Claim #12345
                </td>
                <td className="px-6 py-4 text-right">
                    <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Sort</button>
                </td>
            </tr>
            <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Document_002.pdf
                </th>
                <MatchScoreIndicator score={50} />
                <td className="px-6 py-4">
                    Legal
                </td>
                <td className="px-6 py-4">
                    Claim #67890
                </td>
                <td className="px-6 py-4 text-right">
                    <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Sort</button>
                </td>
            </tr>
            <tr className="bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                    Document_003.pdf
                </th>
                <MatchScoreIndicator score={25} />
                <td className="px-6 py-4">
                    Correspondence
                </td>
                <td className="px-6 py-4">
                    Claim #24680
                </td>
                <td className="px-6 py-4 text-right">
                    <button className="font-medium text-blue-600 dark:text-blue-500 hover:underline">Sort</button>
                </td>
            </tr>
        </tbody>
    </table>
</div>
        </div>
    );
};

export default SuggestedClaims;