const MatchScoreIndicator = ({ score, matchDetails, onProcess, isProcessing }) => {
    const getStatusClass = (score) => {
        if (score >= 70) return 'bg-green-500';
        if (score >= 45) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const getFieldLabel = (field) => {
        const labels = {
            claimNumber: 'Claim Number (30pts)',
            name: 'Name (25pts)',
            dateOfInjury: 'Date of Injury (20pts)',
            employerName: 'Employer (15pts)',
            physicianName: 'Physician (10pts)'
        };
        return labels[field] || field;
    };

    const renderMatchedFields = () => {
        if (!matchDetails?.matchedFields) return null;
        
        return (
            <div className="grid grid-cols-2 gap-2 mt-2">
                {matchDetails.matchedFields.map((field, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                        <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                        </svg>
                        <span>{getFieldLabel(field)}</span>
                        {matchDetails.confidence[field] && (
                            <span className="text-xs text-gray-500">
                                ({Math.round(matchDetails.confidence[field] * 100)}%)
                            </span>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
                <div className="h-2.5 flex-grow bg-gray-200 rounded">
                    <div 
                        className={`h-2.5 rounded ${getStatusClass(score)} transition-all duration-500`}
                        style={{ width: `${score}%` }}
                    ></div>
                </div>
                <span className="font-medium min-w-[4rem]">{score}%</span>
            </div>
            
            {renderMatchedFields()}
            
            {matchDetails?.isRecommended && (
                <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Recommended Match
                </div>
            )}
        </div>
    );
};

export default MatchScoreIndicator; 