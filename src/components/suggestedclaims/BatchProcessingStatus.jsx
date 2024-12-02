import React from 'react';

const BatchProcessingStatus = ({ 
    batchResults, 
    isProcessing, 
    onCancel 
}) => {
    const getProgressPercentage = () => {
        if (!batchResults.total) return 0;
        return Math.round((batchResults.processed / batchResults.total) * 100);
    };

    return (
        <div className="bg-white rounded-lg shadow p-4 mb-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                    Batch Processing Status
                </h3>
                {isProcessing && (
                    <button
                        onClick={onCancel}
                        className="text-red-600 hover:text-red-800"
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
                <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-medium">
                        {getProgressPercentage()}%
                    </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${getProgressPercentage()}%` }}
                    ></div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded">
                    <div className="font-medium text-gray-500">Total</div>
                    <div className="text-lg font-semibold">
                        {batchResults.total}
                    </div>
                </div>
                <div className="bg-green-50 p-3 rounded">
                    <div className="font-medium text-green-600">Success</div>
                    <div className="text-lg font-semibold text-green-700">
                        {batchResults.success.length}
                    </div>
                </div>
                <div className="bg-red-50 p-3 rounded">
                    <div className="font-medium text-red-600">Failed</div>
                    <div className="text-lg font-semibold text-red-700">
                        {batchResults.failed.length}
                    </div>
                </div>
            </div>

            {/* Error List */}
            {batchResults.failed.length > 0 && (
                <div className="mt-4">
                    <h4 className="font-medium text-red-600 mb-2">Errors</h4>
                    <div className="max-h-40 overflow-y-auto">
                        {batchResults.failed.map((failure, index) => (
                            <div 
                                key={index}
                                className="text-sm text-red-600 bg-red-50 p-2 rounded mb-1"
                            >
                                Document {failure.OcrId}: {failure.error || failure.reason}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default BatchProcessingStatus; 