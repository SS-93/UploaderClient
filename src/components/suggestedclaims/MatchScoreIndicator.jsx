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

export default MatchScoreIndicator; 