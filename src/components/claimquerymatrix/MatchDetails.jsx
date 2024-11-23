const MatchDetails = ({ matchDetails }) => {
  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="text-sm font-semibold mb-2">Match Details</h4>
      <div className="grid grid-cols-2 gap-4">
        {matchDetails.matchedFields?.map(field => (
          <div key={field} className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-sm text-gray-600">{field}</span>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <div className="text-xs text-gray-500">
          Match Score: {matchDetails.score}%
        </div>
      </div>
    </div>
  );
}; 

export default MatchDetails;