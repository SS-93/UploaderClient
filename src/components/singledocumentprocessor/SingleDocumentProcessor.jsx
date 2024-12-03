import React, { useState } from 'react';
import MatchScoreIndicator from '../suggestedclaims/MatchScoreIndicator';

const SingleDocumentProcessor = ({ document, matchResults, onProcessComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);

    // Early return if no document
    if (!document) {
        return null;
    }

    // Format match details for display
    const formatMatchDetails = (match) => ({
        score: match?.score || 0,
        matchedFields: match?.matches?.matchedFields || [],
        confidence: match?.matches?.details || {},
        claimNumber: match?.claim?.claimNumber || 'N/A',
        claimantName: match?.claim?.name || 'N/A',
        dateOfInjury: match?.claim?.dateOfInjury || 'N/A',
        physicianName: match?.claim?.physicianName || 'N/A',
        isRecommended: match?.isRecommended || false
    });

    return (
        <div className="bg-white shadow rounded-lg p-4 mb-4">
            <h3 className="text-lg font-semibold mb-2">
                {document.fileName || 'Untitled Document'}
            </h3>
            
            <div className="space-y-4">
                {Array.isArray(matchResults) && matchResults.length > 0 ? (
                    matchResults.map((match, index) => (
                        <div key={index} className="border rounded-lg p-4">
                            <MatchScoreIndicator
                                score={match?.score || 0}
                                matchDetails={formatMatchDetails(match)}
                                isProcessing={isProcessing}
                            />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No match results available</p>
                )}
            </div>
        </div>
    );
};

export default SingleDocumentProcessor; 