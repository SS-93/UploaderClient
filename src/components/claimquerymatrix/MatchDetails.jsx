const MatchDetails = ({ matchDetails }) => {
  if (!matchDetails) {
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold mb-2">Match Details</h4>
        <div className="text-sm text-gray-500">No match details available</div>
      </div>
    );
  }

  // Extract matched fields from the new data structure
  const matchedFields = matchDetails.matches?.matchedFields || matchDetails.matchedFields || [];
  const score = matchDetails.score || 0;
  const confidence = matchDetails.matches?.confidence || matchDetails.confidence || {};

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-semibold mb-2">Match Details</h4>
      
      {/* Matched Fields */}
      <div className="grid grid-cols-2 gap-4">
        {matchedFields.map(field => (
          <div key={field} className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-600">{field}</span>
            {confidence[field] && (
              <span className="text-xs text-gray-400">
                ({(confidence[field] * 100).toFixed(1)}%)
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Match Score */}
      <div className="mt-2">
        <div className="text-xs text-gray-500">
          Match Score: {score.toFixed(1)}%
        </div>
      </div>

      {/* Claim Details if available */}
      {matchDetails.claim && (
        <div className="mt-2 border-t pt-2">
          <h5 className="text-xs font-semibold text-gray-600 mb-1">Claim Information</h5>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
            <div>Claim Number: {matchDetails.claim.claimNumber || 'N/A'}</div>
            <div>Claimant: {matchDetails.claim.name || 'N/A'}</div>
            <div>Physician: {matchDetails.claim.physicianName || 'N/A'}</div>
            <div>Date of Injury: {new Date(matchDetails.claim.dateOfInjury).toLocaleDateString() || 'N/A'}</div>
          </div>
        </div>
      )}

      {/* Match Status */}
      {typeof matchDetails.isRecommended !== 'undefined' && (
        <div className="mt-2 flex items-center">
          <span className={`px-2 py-1 rounded-full text-xs ${
            matchDetails.isRecommended 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {matchDetails.isRecommended ? 'Recommended Match' : 'Alternative Match'}
          </span>
        </div>
      )}
    </div>
  );
};

export default MatchDetails;