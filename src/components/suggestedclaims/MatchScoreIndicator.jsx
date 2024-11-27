const MatchScoreIndicator = ({ score, matchDetails }) => {
    const getMatchDetailsTooltip = () => {
        if (!matchDetails) return '';
        const matchedFields = matchDetails.matchedFields || [];
        return matchedFields.join(', ');
    };

    const getStatusClass = (score) => {
        if (score >= 75) return 'bg-green-500';
        if (score >= 50) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <td className="px-6 py-4">
            <div className="flex flex-col space-y-2">
                {/* Score Bar with Enhanced Tooltip */}
                <div className="flex items-center group relative">
                    <div className="h-2.5 w-full bg-gray-200 rounded dark:bg-gray-700">
                        <div 
                            className={`h-2.5 rounded ${getStatusClass(score)}`}
                            style={{ width: `${score}%` }}
                        ></div>
                    </div>
                    <span className="ml-2 font-medium">{score}%</span>
                    
                    {/* Enhanced Tooltip with Quantum State Indicators */}
                    {matchDetails && (
                        <div className="invisible group-hover:visible absolute top-full left-0 mt-2 p-4 bg-gray-800 text-white text-xs rounded shadow-lg z-10 w-64">
                            <div className="mb-2">
                                <p className="font-semibold mb-1">Matched Fields:</p>
                                <div className="grid grid-cols-2 gap-2">
                                    {matchDetails.matchedFields.map((field, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                            </svg>
                                            <span>{field}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            {matchDetails.matchDetails && (
                                <div className="flex space-x-2 mt-2 border-t pt-2">
                                    {Object.entries(matchDetails.matchDetails).map(([key, value]) => (
                                        <div key={key} className="relative group">
                                            <div className={`w-3 h-3 rounded-full ${
                                                value.matched 
                                                    ? 'bg-gradient-to-r from-green-400 to-green-600' 
                                                    : 'bg-gradient-to-r from-red-400 to-red-600'
                                                } animate-pulse`}>
                                            </div>
                                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-black text-white text-xs rounded p-1 mb-1 whitespace-nowrap">
                                                {key}: {value.score} points
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Match Details Summary with Enhanced Information */}
                {matchDetails && (
                    <div className="text-xs space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {matchDetails.isRecommended && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Recommended
                                </span>
                            )}
                            {matchDetails.claimNumber && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Claim: {matchDetails.claimNumber}
                                </span>
                            )}
                        </div>
                        {matchDetails.claimantName && (
                            <div className="text-gray-600">
                                Claimant: {matchDetails.claimantName}
                            </div>
                        )}
                        {matchDetails.dateOfInjury && (
                            <div className="text-gray-600">
                                Injury Date: {matchDetails.dateOfInjury}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </td>
    );
};

export default MatchScoreIndicator; 