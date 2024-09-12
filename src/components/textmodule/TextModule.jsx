// import React, { useState, useEffect } from 'react';
// import Tesseract from 'tesseract.js';
// import * as pdfjsLib from 'pdfjs-dist';

// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

// function TextModule({ documentUrl, documentId, textContent, onTextExtracted }) {
//   const [isLoading, setIsLoading] = useState(false);
//   const [ocrText, setOcrText] = useState(textContent || 'No OCR text available');
//   const [progress, setProgress] = useState(0);

//   useEffect(() => {
//     if (documentUrl) {
//       if (documentUrl.endsWith('.pdf')) {
//         handlePdf(documentUrl);
//       } else {
//         handleOcr(documentUrl);
//       }
//     }
//   }, [documentUrl]);

//   const handleOcr = (url) => {
//     setIsLoading(true);
//     Tesseract.recognize(url, 'eng', {
//       logger: (m) => {
//         if (m.status === 'recognizing text') {
//           setProgress(Math.round(m.progress * 100));
//         }
//       },
//     })
//       .then((result) => {
//         const extractedText = result.data.text;
//         setOcrText(extractedText);
//         setIsLoading(false);

//         if (documentId) {
//           saveOcrText(documentId, extractedText); // Save OCR text with documentId
//         }
//         onTextExtracted(extractedText); // Notify parent component to update state and other views
//       })
//       .catch((err) => {
//         console.error('OCR error:', err);
//         setIsLoading(false);
//       });
//   };

//   const handlePdf = async (url) => {
//     try {
//       setIsLoading(true);
//       const loadingTask = pdfjsLib.getDocument(url);
//       const pdf = await loadingTask.promise;
//       const numPages = pdf.numPages;
//       let combinedText = '';

//       for (let pageNum = 1; pageNum <= numPages; pageNum++) {
//         const page = await pdf.getPage(pageNum);
//         const viewport = page.getViewport({ scale: 1.5 });
//         const canvas = document.createElement('canvas');
//         const context = canvas.getContext('2d');
//         canvas.height = viewport.height;
//         canvas.width = viewport.width;

//         await page.render({ canvasContext: context, viewport: viewport }).promise;
//         const imageUrl = canvas.toDataURL();

//         await Tesseract.recognize(imageUrl, 'eng', {
//           logger: (m) => {
//             if (m.status === 'recognizing text') {
//               setProgress(Math.round((pageNum / numPages) * 100));
//             }
//           },
//         })
//           .then((result) => {
//             combinedText += result.data.text + '\n';
//           })
//           .catch((err) => {
//             console.error('PDF OCR error on page', pageNum, ':', err);
//           });
//       }

//       setOcrText(combinedText);
//       setIsLoading(false);

//       if (documentId) {
//         saveOcrText(documentId, combinedText); // Save OCR text with documentId
//       }
//       onTextExtracted(combinedText); // Notify parent component to update state and other views
//     } catch (error) {
//       console.error('Error handling PDF:', error);
//       setIsLoading(false);
//     }
//   };

//   const saveOcrText = async (documentId, text) => {
//     try {
//       const response = await fetch(`http://localhost:4000/dms/ocr-text/by-documentId`, {
//         method: 'PUT',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ documentId, ocrTextContent: text }),
//       });

//       if (response.ok) {
//         console.log('OCR text content saved successfully.');
//       } else {
//         console.error('Failed to save OCR text content:', response.statusText);
//       }
//     } catch (error) {
//       console.error('Error saving OCR text content:', error);
//     }
//   };

//   const handleTextChange = (event) => {
//     setOcrText(event.target.value);
//   };

//   const handleSubmit = (event) => {
//     event.preventDefault();
//     if (documentId) {
//       saveOcrText(documentId, ocrText); // Save OCR text
//     }
//   };

//   return (
//     <div className="ml-60 pl-8 mr-2 pr-2">
//       <div className="mx-auto">
//         <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//           <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//             <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//               OCR Text Output
//             </h3>
//             <button
//               type="button"
//               className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//               onClick={() => setOcrText('')} // Clear text on button click
//             >
//               <svg
//                 className="w-3 h-3"
//                 aria-hidden="true"
//                 xmlns="http://www.w3.org/2000/svg"
//                 fill="none"
//                 viewBox="0 0 14 14"
//               >
//                 <path
//                   stroke="currentColor"
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth="2"
//                   d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
//                 />
//               </svg>
//               <span className="sr-only">Clear text</span>
//             </button>
//           </div>

//           <div className="p-4 md:p-5 space-y-4">
//             <form onSubmit={handleSubmit}>
//               <textarea
//                 id="ocr-output"
//                 value={ocrText}
//                 onChange={handleTextChange}
//                 className="w-full h-32 text-base leading-relaxed text-gray-500 dark:text-gray-400 border rounded-md p-2"
//               />
//               <button
//                 type="submit"
//                 className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
//               >
//                 Save Changes
//               </button>
//             </form>

//             {isLoading && (
//               <div>
//                 <progress className="form-control" value={progress} max="100">
//                   {progress}%{' '}
//                 </progress>
//                 <p className="text-center py-0 my-0">Converting: {progress}%</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default TextModule;

import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function TextModule({ documentUrl, documentId, textContent = '', onTextExtracted }) {
  const [isLoading, setIsLoading] = useState(false);
  const [ocrText, setOcrText] = useState(textContent);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');  // New state to handle feedback messages

  // Handle changes in the input field for manual text editing
  const handleTextChange = (event) => {
    setOcrText(event.target.value);
  };

  useEffect(() => {
    if (documentUrl) {
      if (documentUrl.endsWith('.pdf')) {
        handlePdf(documentUrl);
      } else {
        handleOcr(documentUrl);
      }
    }
  }, [documentUrl]);

  // Function to handle OCR for non-PDF documents
  const handleOcr = (url) => {
    setIsLoading(true);
    Tesseract.recognize(url, 'eng', {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        }
      },
    })
      .then((result) => {
        const extractedText = result.data.text;
        setOcrText(extractedText);
        setIsLoading(false);

        if (documentId) {
          saveOcrText(documentId, extractedText); // Save OCR text with documentId
        }
        onTextExtracted(extractedText); // Notify parent of extracted text
      })
      .catch((err) => {
        console.error('OCR error:', err);
        setIsLoading(false);
      });
  };

  // Function to handle OCR for PDF documents
  const handlePdf = async (url) => {
    try {
      setIsLoading(true);
      const loadingTask = pdfjsLib.getDocument(url);
      const pdf = await loadingTask.promise;
      const numPages = pdf.numPages;
      let combinedText = '';

      for (let pageNum = 1; pageNum <= numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport: viewport }).promise;
        const imageUrl = canvas.toDataURL();

        await Tesseract.recognize(imageUrl, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setProgress(Math.round((pageNum / numPages) * 100));
            }
          },
        })
          .then((result) => {
            combinedText += result.data.text + '\n';
          })
          .catch((err) => {
            console.error('PDF OCR error on page', pageNum, ':', err);
          });
      }

      setOcrText(combinedText);
      setIsLoading(false);

      if (documentId) {
        saveOcrText(documentId, combinedText); // Save OCR text with documentId
      }
      onTextExtracted(combinedText); // Notify parent of extracted text
    } catch (error) {
      console.error('Error handling PDF:', error);
      setIsLoading(false);
    }
  };

  // Function to save OCR text to the backend with the documentId
  const saveOcrText = async (documentId, ocrText) => {
    try {
      const response = await fetch(`http://localhost:4000/dms/documents/${1917}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ textContent: ocrText }), // Send OCR text as textContent
      });

      if (response.ok) {
        setMessage('OCR text content saved successfully.');
      } else {
        const errorResponse = await response.json();
        setMessage(`Failed to save OCR text: ${errorResponse.error}`);
      }
    } catch (error) {
      console.error('Error saving OCR text content:', error);
      setMessage('Error saving OCR text.');
    }
  };

  // Handle manual text submission
  const handleSubmit = (event) => {
    event.preventDefault();
    if (!documentId) {
      setMessage('Document ID is required to update text content.');
      return;
    }

    saveOcrText(documentId, ocrText); // Save OCR text when submitting
  };

  return (
    <div className="ml-60 pl-8 mr-2 pr-2">
      <div className="mx-auto">
        <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
          <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              OCR Text Output
            </h3>
            <button
              type="button"
              className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              onClick={() => setOcrText('')} // Clear text
            >
              <svg
                className="w-3 h-3"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 14"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                />
              </svg>
              <span className="sr-only">Close modal</span>
            </button>
          </div>

          <div className="p-4 md:p-5 space-y-4">
            <form onSubmit={handleSubmit}>
              <textarea
                id="ocr-output"
                value={ocrText}
                onChange={handleTextChange}
                rows="4"
                cols="50"
                className="w-full h-32 text-base leading-relaxed text-gray-500 dark:text-gray-400 border rounded-md p-2"
              />
              <button
                type="submit"
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save Changes
              </button>
            </form>
            {isLoading && (
              <div>
                <progress className="form-control" value={progress} max="100">
                  {progress}%
                </progress>
                <p className="text-center py-0 my-0">Converting: {progress}%</p>
              </div>
            )}
            {message && <p className="text-center py-0 my-0">{message}</p>} {/* Display message */}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TextModule;


