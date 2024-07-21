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
        
     <div className="pl-5 ml-4 mr-4">
      <div className=" ml-60 p-4 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 mt-14">
        <div className="relative bg-white p-6 rounded-lg shadow-lg dark:bg-gray-700 flex justify-center items-center">
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:text-gray-300 dark:hover:text-white"
          >
            X
          </button>
          {loading && <p>Loading document...</p>}
          {error && <p>Error loading document: {error}</p>}
          {!loading && !error && documentUrl ? (
            <div className='max-h-[500px]w-full overflow-y-auto'>
            <DocViewer
              documents={[{ uri: documentUrl }]}
              pluginRenderers={DocViewerRenderers}
              className="w-full h-auto "
            />
            </div>
          ) : (
            !loading && !error && <p>No document selected</p>
          )}
        </div>
      </div>
    </div>
  </div>


  )
}

export default DocumentViewer