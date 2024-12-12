import React, { useState, useEffect } from 'react';
import {
    getStatusClass,
    getFieldPoints,
    getFieldLabel,
    formatFieldValue,
    formatConfidence,
    getMatchQuality,
    getFieldMatchDetails,
    getMatchSummary,
    formatFieldName
} from '../../utils/matchDisplayUtils';

const MatchScoreIndicator = ({ selectedOcrId, matchResults }) => {
    const [matchHistory, setMatchHistory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchMatchHistory = async () => {
            setIsLoading(true);
            try {
                const response = await fetch(`http://localhost:4000/ai/match-history/${selectedOcrId}`);
                if (!response.ok) throw new Error('Failed to fetch match history');
                
                const data = await response.json();
                setMatchHistory({
                    topScore: data.topScore,
                    totalMatches: data.totalMatches,
                    matchResults: data.matchResults?.map(match => ({
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
                });
            } catch (error) {
                console.error('Error fetching match history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (selectedOcrId) {
            fetchMatchHistory();
        }
    }, [selectedOcrId]);

    // Use passed matchResults if available, otherwise use fetched history
    const displayData = matchResults || matchHistory;
    const topMatch = displayData?.matchResults?.[0];

    if (isLoading) {
        return <div className="animate-pulse">Loading match history...</div>;
    }

    if (!displayData) {
        return <div>No match data available</div>;
    }

    return (
        <div className="bg-white rounded-lg shadow p-4">
            {/* Top Score Indicator */}
            <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Top Match Score</span>
                    <span className="text-lg font-bold">{displayData.topScore}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full">
                    <div 
                        className={`h-2 rounded-full ${getScoreColorClass(displayData.topScore)}`}
                        style={{ width: `${displayData.topScore}%` }}
                    />
                </div>
            </div>

            {/* Match Details */}
            {topMatch && (
                <div className="space-y-4">
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-2">Best Match Details</h3>
                        <div className="space-y-2">
                            {Object.entries(topMatch.matchDetails).map(([key, value]) => (
                                value && (
                                    <div key={key} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{formatFieldName(key)}:</span>
                                        <span className="font-medium">{formatFieldValue(key, value)}</span>
                                    </div>
                                )
                            ))}
                        </div>
                    </div>

                    {/* Matched Fields */}
                    <div className="border-t pt-4">
                        <h3 className="text-sm font-medium mb-2">Matched Fields</h3>
                        <div className="space-y-2">
                            {topMatch.matchedFields.map((field, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>{formatFieldName(field)}</span>
                                    <span className="font-medium">
                                        {formatConfidence(topMatch.confidence[field])}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Match Stats */}
                    <div className="border-t pt-4 text-sm text-gray-600">
                        <div>Total Matches Found: {displayData.totalMatches}</div>
                        <div>
                            Status: {topMatch.isRecommended ? 
                                <span className="text-green-600">Recommended</span> : 
                                <span className="text-yellow-600">Review Needed</span>
                            }
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Utility function for score colors
const getScoreColorClass = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 45) return 'bg-yellow-500';
    return 'bg-red-500';
};

export default MatchScoreIndicator; 