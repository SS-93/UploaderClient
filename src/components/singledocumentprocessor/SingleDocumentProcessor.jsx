import React, { useState, useEffect } from 'react';
import MatchScoreIndicator from '../suggestedclaims/MatchScoreIndicator';

const SingleDocumentProcessor = ({ document, onProcessComplete }) => {
    const [processing, setProcessing] = useState(false);
    const [matchResults, setMatchResults] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (document) {
            processDocument(document);
        }
    }, [document]);

    const processDocument = async (doc) => {
        setProcessing(true);
        try {
            // Perform NER
            const nerResponse = await fetch('http://localhost:4000/ai/ner', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: doc.textContent, OcrId: doc.OcrId })
            });

            if (!nerResponse.ok) throw new Error('NER processing failed');
            const { entities } = await nerResponse.json();

            // Find matches
            const matchResults = await findMatches(entities);

            if (!matchResults || !matchResults.matchResults) {
                throw new Error('Match results are empty');
            }

            setMatchResults(matchResults);
            onProcessComplete(doc.OcrId, matchResults);

        } catch (err) {
            setError(err.message);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {document.fileName}
            </h3>
            {processing ? (
                <p className="text-blue-500">Processing...</p>
            ) : error ? (
                <p className="text-red-500">Error: {error}</p>
            ) : matchResults ? (
                <div className="mt-4">
                    <MatchScoreIndicator
                        score={matchResults.topScore}
                        matchDetails={matchResults.matchResults[0]}
                    />
                </div>
            ) : (
                <p className="text-gray-500">No match results available</p>
            )}
        </div>
    );
};

export default SingleDocumentProcessor; 