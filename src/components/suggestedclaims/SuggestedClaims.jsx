import React from 'react';

function SuggestedClaims({ selectedDocument, indexedClaims }) {
  // Safely access document properties
  const documentInfo = selectedDocument ? {
    title: selectedDocument.fileName || 'Unnamed Document',
    category: selectedDocument.category || 'Uncategorized',
    ocrId: selectedDocument.OcrId || 'N/A'
  } : null;

  return (
    <div className="p-4">
      <div className="mb-6">
        <h2 className="text-xl font-bold mb-2">Selected Document:</h2>
        {documentInfo ? (
          <div className="bg-gray-100 p-4 rounded-lg">
            <p className="text-gray-700"><span className="font-semibold">Title:</span> {documentInfo.title}</p>
            <p className="text-gray-700"><span className="font-semibold">Category:</span> {documentInfo.category}</p>
            <p className="text-gray-700"><span className="font-semibold">OCR ID:</span> {documentInfo.ocrId}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No document selected</p>
        )}
      </div>

      <h2 className="text-xl font-bold mb-4">Suggested Matches</h2>
      <div className="relative overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-200 uppercase bg-slate-900">
            <tr>
              <th scope="col" className="px-6 py-3">Match Score</th>
              <th scope="col" className="px-6 py-3">Claim Number</th>
              <th scope="col" className="px-6 py-3">Name</th>
              <th scope="col" className="px-6 py-3">Date of Injury</th>
              <th scope="col" className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {indexedClaims.map((claim) => (
              <tr key={claim._id} className="bg-stone-600 border-b hover:bg-stone-700">
                <td className="px-6 py-4">
                  <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${claim.matchScore >= 50 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {claim.matchScore}%
                  </div>
                </td>
                <td className="px-6 py-4">{claim.claimNumber}</td>
                <td className="px-6 py-4">{claim.name}</td>
                <td className="px-6 py-4">{claim.dateOfInjury}</td>
                <td className="px-6 py-4">
                  <button 
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                    onClick={() => handleSort(claim._id)}
                  >
                    Sort
                  </button>
                </td>
              </tr>
            ))}
            {indexedClaims.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center italic">
                  No matches found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SuggestedClaims; 