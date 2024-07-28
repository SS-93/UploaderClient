// // import React from 'react'

// // function TextModule() {



// //   return (
// //     <div>TextModule</div>
// //   )
// // }

// // export default TextModule

// import React, { useState } from 'react';

// function TextModule  ({ Text }) {
// //   const [isOpen, setIsOpen] = useState(true);

// //   const toggleModal = () => {
// //     setIsOpen(isOpen);
// //   };

//   return (
//     <>
//       {/* Modal toggle button */}
//       <button
//         // onClick={toggleModal}
//         className="block text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//         type="button"
//       >
//         View OCR Text
//       </button>

//       {/* Main modal */}
//       {/* {isOpen && ( */}
//         <div
       
//           className="  ml-60 pl-8 mr-2 pr-2"
//         >
//           <div className=" mx-auto ">
//             {/* Modal content */}
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               {/* Modal header */}
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   OCR Text Output
//                 </h3>
//                 <button
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               {/* Modal body */}
//               <div className="p-4 md:p-5 space-y-4">
//                 <div id="ocr-output" className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
//                   {Text || 'No OCR text available'}
//                 </div>
//               </div>
//               {/* Modal footer */}
//               <div className="flex items-center p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
//                 <button
                
//                   type="button"
//                   className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
//                 >
//                   Read
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
      
//     </>
//   );
// };

// export default TextModule;
// import React, {useState} from 'react';
// import Tesseract from 'tesseract.js';


// const App = () => {
//   const [isLoading, setIsLoading] = React.useState(false);
//   const [image, setImage] = React.useState('');
//   const [text, setText] = React.useState('');
//   const [progress, setProgress] = React.useState(0);

//   const handleSubmit = () => {
//     setIsLoading(true);
//     Tesseract.recognize(image, 'eng', {
//       logger: (m) => {
//         console.log(m);
//         if (m.status === 'recognizing text') {
//           setProgress(parseInt(m.progress * 100));
//         }
//       },
//     })
//       .catch((err) => {
//         console.error(err);
//       })
//       .then((result) => {
//         console.log(result.data);
//         setText(result.data.text);
//         setIsLoading(false);
//       });
//   };

//   return (
//     <div className="container" style={{ height: '100vh' }}>
//       <div className="row h-100">
//         <div className="col-md-5 mx-auto h-100 d-flex flex-column justify-content-center">
//           {!isLoading && (
//             <h1 className="text-center py-5 mc-5">Image To Text</h1>
//           )}
//           {isLoading && (
//             <>
//               <progress className="form-control" value={progress} max="100">
//                 {progress}%{' '}
//               </progress>{' '}
//               <p className="text-center py-0 my-0">Converting:- {progress} %</p>
//             </>
//           )}
//           {!isLoading && !text && (
//             <>
//               <input
//                 type="file"
//                 onChange={(e) =>
//                   setImage(URL.createObjectURL(e.target.files[0]))
//                 }
//                 className="form-control mt-5 mb-2"
//               />
//               <input
//                 type="button"
//                 onClick={handleSubmit}
//                 className="btn btn-primary mt-5"
//                 value="Convert"
//               />
//             </>
//           )}
//           {!isLoading && text && (
//             <>
//               <textarea
//                 className="form-control w-100 mt-5"
//                 rows="30"
//                 value={text}
//                 onChange={(e) => setText(e.target.value)}
//               ></textarea>
//             </>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default App;

//? OCR WORKS 
  // import React, { useState, useEffect } from 'react';
  // import Tesseract from 'tesseract.js';

  // function TextModule({ Text, documentUrl }) {
  //   const [isLoading, setIsLoading] = useState(false);
  //   const [text, setText] = useState(Text || 'No OCR text available');
  //   const [progress, setProgress] = useState(0);

  //   useEffect(() => {
  //     if (documentUrl) {
  //       handleOcr(documentUrl);
  //     }
  //   }, [documentUrl]);

  //   const handleOcr = (url) => {
  //     setIsLoading(true);
  //     Tesseract.recognize(url, 'eng', {
  //       logger: (m) => {
  //         console.log(m);
  //         if (m.status === 'recognizing text') {
  //           setProgress(parseInt(m.progress * 100));
  //         }
  //       },
  //     })
  //       .catch((err) => {
  //         console.error(err);
  //       })
  //       .then((result) => {
  //         console.log(result.data);
  //         setText(result.data.text);
  //         setIsLoading(false);
  //       });
  //   };

  //   return (
  //     <>
  //       <div className="ml-60 pl-8 mr-2 pr-2">
  //         <div className="mx-auto">
  //           <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
  //             <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
  //               <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
  //                 OCR Text Output
  //               </h3>
  //               <button
  //                 type="button"
  //                 className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
  //               >
  //                 <svg
  //                   className="w-3 h-3"
  //                   aria-hidden="true"
  //                   xmlns="http://www.w3.org/2000/svg"
  //                   fill="none"
  //                   viewBox="0 0 14 14"
  //                 >
  //                   <path
  //                     stroke="currentColor"
  //                     strokeLinecap="round"
  //                     strokeLinejoin="round"
  //                     strokeWidth="2"
  //                     d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
  //                   />
  //                 </svg>
  //                 <span className="sr-only">Close modal</span>
  //               </button>
  //             </div>

  //             <div className="p-4 md:p-5 space-y-4">
  //               <div id="ocr-output" className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
  //                 {isLoading ? (
  //                   <>
  //                     <progress className="form-control" value={progress} max="100">
  //                       {progress}%{' '}
  //                     </progress>
  //                     <p className="text-center py-0 my-0">Converting: {progress} %</p>
  //                   </>
  //                 ) : (
  //                   text
  //                 )}
  //               </div>
  //             </div>
  //           </div>
  //         </div>
  //       </div>
  //     </>
  //   );
  // }

  // export default TextModule;
  import React, { useState, useEffect } from 'react';
import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

function TextModule({ Text, documentUrl }) {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState(Text || 'No OCR text available');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (documentUrl) {
      if (documentUrl.endsWith('.pdf')) {
        handlePdf(documentUrl);
      } else {
        handleOcr(documentUrl);
      }
    }
  }, [documentUrl]);

  const handleOcr = (url) => {
    setIsLoading(true);
    Tesseract.recognize(url, 'eng', {
      logger: (m) => {
        console.log(m);
        if (m.status === 'recognizing text') {
          setProgress(parseInt(m.progress * 100));
        }
      },
    })
      .catch((err) => {
        console.error(err);
      })
      .then((result) => {
        console.log(result.data);
        setText(result.data.text);
        setIsLoading(false);
      });
  };

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
            console.log(m);
            if (m.status === 'recognizing text') {
              setProgress(parseInt((pageNum / numPages) * 100));
            }
          },
        })
          .catch((err) => {
            console.error(err);
          })
          .then((result) => {
            combinedText += result.data.text + '\n';
          });
      }

      setText(combinedText);
      setIsLoading(false);
    } catch (error) {
      console.error('Error handling PDF:', error);
      setIsLoading(false);
    }
  };

  return (
    <>
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
              <div id="ocr-output" className="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                {isLoading ? (
                  <>
                    <progress className="form-control" value={progress} max="100">
                      {progress}%{' '}
                    </progress>
                    <p className="text-center py-0 my-0">Converting: {progress} %</p>
                  </>
                ) : (
                  text
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TextModule;

  