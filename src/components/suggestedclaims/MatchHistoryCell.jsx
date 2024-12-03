import React, { useState } from 'react';
import MatchScoreIndicator from './MatchScoreIndicator';

const MatchHistoryCell = ({ matchHistory }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    if (!matchHistory?.length) {
        return <span className="text-gray-400">No history</span>;
    }

    const recentMatches = isExpanded ? matchHistory : matchHistory.slice(0, 3);

    return (
        <div className="relative">
            <div className="space-y-2">
                {recentMatches.map((match, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                        <MatchScoreIndicator score={match.matchResults?.[0]?.score || 0} />
                        <span className="text-gray-600">
                            {new Date(match.matchedAt).toLocaleDateString()}
                        </span>
                        <span className="font-medium">
                            {match.matchResults?.[0]?.claim?.claimNumber || 'No claim'}
                        </span>
                    </div>
                ))}
            </div>
            
            {matchHistory.length > 3 && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-blue-500 text-sm hover:underline mt-2"
                >
                    {isExpanded ? 'Show less' : `Show ${matchHistory.length - 3} more`}
                </button>
            )}
        </div>
    );
};

export default MatchHistoryCell; 