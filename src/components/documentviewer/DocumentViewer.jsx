import React, {useState, useEffect} from 'react'
import DocViewer, { DocViewerRenderers} from "@cyntler/react-doc-viewer"

function DocumentViewer({ documentUrl, onClose}) {
    const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

//   useEffect(() => {
//     if (documentUrl) {
//       setLoading(true);
//       setError(null);
//       fetch(documentUrl)
//         .then((response) => {
//           if (!response.ok) {
//             throw new Error('Network response was not ok');
//           }
//           setLoading(false);
//         })
//         .catch((err) => {
//           setError(err.message);
//           setLoading(false);
//         });
//     }
//   }, [documentUrl]);

useEffect(() => {
    if (documentUrl) {
      setLoading(true);
      setError(null);
      fetch(documentUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [documentUrl]);

  return (
    <div>
        
        <div className="p-4 sm:ml-64">
    <div className="p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14"> 
      {/* <div className="grid grid-cols-3 gap-4 mb-4"></div>

      DOCUMENT VIEWER 
      <div className="flex items-center justify-center h-48 mb-4 rounded bg-gray-50 dark:bg-gray-800">
        <p className="text-2xl text-slate-400 dark:text-gray-500">
          DOCUMENT VIEWER
        </p>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4"></div> */}

<div className="bg-white p-6 rounded-lg shadow-lg relative flex items-center justify-center h-48 mb-4 rounded bg-gray-50 dark:bg-gray-800">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
          Close
        </button>
        {loading && <p>Loading document...</p>}
        {error && <p>Error loading document: {error}</p>}
        {!loading && !error && documentUrl ? (
          <DocViewer
            documents={[{ uri: documentUrl }]}
            pluginRenderers={DocViewerRenderers}
          />
        ) : (
          !loading && !error && <p>No document selected</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4"></div>
    </div>  
  </div>

 </div> 
  )
}

export default DocumentViewer