import React, { useState, useEffect } from 'react';

function DocumentDataTable({ claimId, onViewDocument }) {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);


  useEffect(() => {
    fetchDocuments();
  }, [claimId]);

  const fetchDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`);
      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    }
  };

  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setFileName(selectedFile.name);
    setIsFileSelected(true);
  };

  const onFileNameChange = (e) => {
    setFileName(e.target.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('document', file);
    formData.append('fileName', fileName);
    formData.append('claimId', claimId);

    try {
      const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchDocuments(); // Refresh the document list after upload
        setIsFileSelected(false); // Reset file selection
        setFile(null);
        setFileName(''); // Reset file name input
      } else {
        console.error('Upload failed');
      }
    } catch (err) {
      console.error(err);
    }
  };


  // const handleViewDocument = async (fileKey) => {
  //   try {
  //     const res = await fetch(`http://localhost:4000/new/documents/${fileKey}/`);
  //     if (!res.ok) {
  //       throw new Error('Failed to fetch signed URL');
  //     }
  //     const data = await res.json();
  //     onViewDocument(data.url); // Use the signed URL to view the document
  //   } catch (err) {
  //     console.error('Error fetching signed URL:', err);
  //   }
  // };

  // const handleViewDocument = async (fileKey) => {
  //   try {
  //     console.log(`Fetching signed URL for fileKey: ${fileKey}`); // Log the file key
  
  //     const res = await fetch(`http://localhost:4000/new/documents/${fileKey}/signed-url`);
  //     if (!res.ok) {
  //       throw new Error('Failed to fetch signed URL');
  //     }
  //     const data = await res.json();
  //     console.log(`Signed URL: ${data.url}`); // Log the signed URL
  
  //     onViewDocument(data.url); // Use the signed URL to view the document
  //   } catch (err) {
  //     console.error('Error fetching signed URL:', err);
  //   }
  // };

  const handleViewDocument = async (fileKey) => {
    try {
      console.log(`Fetching document for fileKey: ${fileKey}`); // Log the file key

      const res = await fetch(`http://localhost:4000/new/documents/${fileKey}/signed-url`);
      if (!res.ok) {
        throw new Error('Failed to fetch document');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      onViewDocument(url); // Pass the blob URL to the viewer
    } catch (err) {
      console.error('Error fetching document:', err);
    }
  };

  // const handleDownloadDocument = async (fileKey) => {
  //   try {
  //     console.log(`Fetching document for fileKey: ${fileKey}`); // Log the file key
  
  //     const res = await fetch(`https://iluploadmetest.s3.us-east-2.amazonaws.com/${fileKey}/`);
  //     if (!res.ok) {
  //       throw new Error('Failed to fetch document');
  //     }

  //     const data = await res.json 

  //     const documentResponse = await fetch(data.url);
  //     if (!documentResponse.ok) {
  //       throw new Error('Failed to fetch document');
  //     }


    
  //     const url = res.url;

      
  //     const a = document.createElement('a');
      
  //     a.href = url 
  //     a.href = url;
  //     a.download = fileKey; // You can set a more descriptive file name if needed
  //     document.body.appendChild(a);
  //     a.click();
  //     a.remove();
  //     console.log(`File downloaded and URL created: ${url}`);
  //   } catch (err) {
  //     console.error('Error fetching document:', err);
  //   }
  // };
const handleDownloadDocument = async (fileKey) => {
  try {
    console.log(`Fetching document for fileKey: ${fileKey}`); // Log the file key

    // Construct the correct URL
    const url = `${fileKey}`;

    // Fetch the document
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error('Failed to fetch document');
    }

    // Create a link element and trigger a download
    const a = document.createElement('a');
    a.href = url;
    a.download = fileKey; // You can set a more descriptive file name if needed
    document.body.appendChild(a);
    a.click();
    a.remove();
    console.log(`File downloaded from URL: ${url}`);
  } catch (err) {
    console.error('Error fetching document:', err);
  }
};


  return (
    <div>
      <section className="bg-slate-900 dark:bg-gray-900 p-3 sm:p-5">
        <div className="mx-auto max-w-screen-lg pl-1 ml-60">
          <div className=" absolute bottom-0 bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full absolute right-0 relative shadow-md sm:rounded-lg overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
              <div className="w-full md:w-1/2">
                <form className="flex items-center">
                  <label htmlFor="simple-search" className="sr-only">Search</label>
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" required="" />
                  </div>
                </form>
              </div>
              <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
                <form onSubmit={onSubmit} className="flex items-center space-x-3">
                  <input type="file" onChange={onFileChange} required className="hidden" id="file-upload" />
                  <label htmlFor="file-upload" className="flex items-center justify-center text-white bg-primary-700 hover:bg-blue-300 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-4 py-2 cursor-pointer">
                    <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                    </svg>
                    Add document
                  </label>
                  {isFileSelected && (
                    <>
                      <input
                        type="text"
                        value={fileName}
                        onChange={onFileNameChange}
                        placeholder="Edit file name"
                        className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                        required
                      />
                      <button type="submit" className="flex items-center justify-center text-white bg-blue-600 hover:bg-blue-300 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-4 py-2">
                        Upload
                      </button>
                    </>
                  )}
                </form>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">Document Name</th>
                    <th scope="col" className="px-4 py-3">Uploaded Date</th>
                    <th scope="col" className="px-4 py-3">Uploader</th>
                    <th scope="col" className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc._id} className="border-b dark:border-gray-700">
                      <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        {doc.fileName}
                      </th>
                      <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                      <td className="px-4 py-3">Uploaded Document</td>
                      <td className="px-4 py-3"><a href="#" onClick={() => handleViewDocument(doc.fileUrl)}>View</a></td>
                      <td className="px-4 py-3"><a href="#" onClick={() => handleDownloadDocument(doc.fileUrl)}>Download</a></td>

                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default DocumentDataTable;




// import React, { useState } from 'react';

// function DocumentDataTable({ documents = [], fetchDocuments, claimId }) {
//   const [file, setFile] = useState(null);
//   const [isFileSelected, setIsFileSelected] = useState(false);

//   const onFileChange = (e) => {
//     const selectedFile = e.target.files[0];
//     setFile(selectedFile);
//     setIsFileSelected(true);
//     console.log("Selected file info:", selectedFile);
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('document', file);
//     formData.append('claimId', claimId);

//     try {
//       const res = await fetch('http://localhost:4000/dms/upload', {
//         method: 'POST',
//         body: formData,
//       });

//       if (res.ok) {
//         const responseData = await res.json();
//         console.log("Uploaded file info:", responseData.file);

//         fetchDocuments(); // Call to refresh the document list
//         setIsFileSelected(false); // Reset file selection
//         setFile(null);
//       } else {
//         console.error('Upload failed');
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div>
//       <section className="bg-slate-900 dark:bg-gray-900 p-3 sm:p-5">
//         <div className="mx-auto max-w-screen-lg pl-1 ml-60">
//           <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full absolute right-0 relative shadow-md sm:rounded-lg overflow-hidden">
//             <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
//               <div className="w-full md:w-1/2">
//                 <form className="flex items-center">
//                   <label htmlFor="simple-search" className="sr-only">Search</label>
//                   <div className="relative w-full">
//                     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                       <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                         <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                     <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" required="" />
//                   </div>
//                 </form>
//               </div>
//               <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
//                 <form onSubmit={onSubmit} className="flex items-center space-x-3">
//                   <input type="file" onChange={onFileChange} required className="hidden" id="file-upload" />
//                   <label htmlFor="file-upload" className="flex items-center justify-center text-white bg-primary-700 hover:bg-blue-300 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-4 py-2 cursor-pointer">
//                     <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
//                       <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
//                     </svg>
//                     Add document
//                   </label>
//                   {isFileSelected && (
//                     <button type="submit" className="flex items-center justify-center text-white bg-blue-600 hover:bg-blue-300 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-4 py-2">
//                       Upload
//                     </button>
//                   )}
//                 </form>
//               </div>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
//                   <tr>
//                     <th scope="col" className="px-4 py-3">Document Name</th>
//                     <th scope="col" className="px-4 py-3">Uploaded Date</th>
//                     <th scope="col" className="px-4 py-3">Uploader</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {documents.map((doc) => (
//                     <tr key={doc._id} className="border-b dark:border-gray-700">
//                       <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                         {doc.fileName}
//                       </th>
//                       <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
//                       <td className="px-4 py-3">{doc.uploader}</td>
//                     </tr>
//                   ))}
//                   {/* Adding a blank document entry */}
//                   <tr className="border-b dark:border-gray-700">
//                     <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                       Blank Document
//                     </th>
//                     <td className="px-4 py-3">June 22nd, 2024 </td>
//                     <td className="px-4 py-3">First Name Last Name</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default DocumentDataTable;


// import React, { useState } from 'react';

// function DocumentDataTable({ documents = [], fetchDocuments }) {
//   const [file, setFile] = useState(null);

//   const onFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const onSubmit = async (e) => {
//     e.preventDefault();
//     const formData = new FormData();
//     formData.append('image', file);

//     try {
//       const res = await fetch('http://localhost:4000/dms/images', {
//         method: 'POST',
//         body: formData,
//       });

//       if (res.ok) {
//         fetchDocuments(); // Call to refresh the document list
//       } else {
//         console.error('Upload failed');
//       }
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div>
//       <section className="bg-slate-900 dark:bg-gray-900 p-3 sm:p-5">
//         <div className="mx-auto max-w-screen-lg pl-1 ml-60">
//           <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full absolute right-0 relative shadow-md sm:rounded-lg overflow-hidden">
//             <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
//               <div className="w-full md:w-1/2">
//                 <form className="flex items-center">
//                   <label htmlFor="simple-search" className="sr-only">Search</label>
//                   <div className="relative w-full">
//                     <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                       <svg aria-hidden="true" className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                         <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
//                       </svg>
//                     </div>
//                     <input type="text" id="simple-search" className="bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" required="" />
//                   </div>
//                 </form>
//               </div>
//               <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
//                 <form onSubmit={onSubmit} className="flex items-center space-x-3">
//                   <input type="file" onChange={onFileChange} required className="hidden" id="file-upload" />
//                   <label htmlFor="file-upload" className="flex items-center justify-center text-white bg-primary-700 hover:bg-blue-300 focus:ring-4 focus:ring-purple-200 font-medium rounded-lg text-sm px-4 py-2 cursor-pointer">
//                     <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
//                       <path clipRule="evenodd" fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
//                     </svg>
//                     Add document
//                   </label>
//                   <button type="submit" className="hidden">Upload</button>
//                 </form>
//               </div>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
//                   <tr>
//                     <th scope="col" className="px-4 py-3">Document Name</th>
//                     <th scope="col" className="px-4 py-3">Uploaded Date</th>
//                     <th scope="col" className="px-4 py-3">Uploader</th>
//                     <th scope="col" className="px-4 py-3">Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {documents.map((doc) => (
//                     <tr key={doc._id} className="border-b dark:border-gray-700">
//                       <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                         {doc.fileName}
//                       </th>
//                       <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
//                       <td className="px-4 py-3">{doc.uploader}</td>
//                       <td className="px-4 py-3 flex items-center justify-end">
//                         <button className="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                           <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                             <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                           </svg>
//                         </button>
//                         <div className="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                           <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
//                             <li>
//                               <a href="#" className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                             </li>
//                             <li>
//                               <a href="#" className="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                             </li>
//                           </ul>
//                           <div className="py-1">
//                             <a href="#" className="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                           </div>
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//             <nav className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
//               <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
//                 Showing
//                 <span className="font-semibold text-gray-900 dark:text-white">1-10</span>
//                 of
//                 <span className="font-semibold text-gray-900 dark:text-white">1000</span>
//               </span>
//               <ul className="inline-flex items-stretch -space-x-px">
//                 <li>
//                   <a href="#" className="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
//                     <span className="sr-only">Previous</span>
//                     <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                       <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
//                     </svg>
//                   </a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
//                 </li>
//                 <li>
//                   <a href="#" aria-current="page" className="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">...</a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">100</a>
//                 </li>
//                 <li>
//                   <a href="#" className="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
//                     <span className="sr-only">Next</span>
//                     <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                       <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
//                     </svg>
//                   </a>
//                 </li>
//               </ul>
//             </nav>
//           </div>
//         </div>
//       </section>
//     </div>
//   );
// }

// export default DocumentDataTable;



// import React from 'react'

// function DocumentDataTable({claimsData, documents}) {
//   return (
//     <div><section class="bg-slate-900 dark:bg-gray-900 p-3 sm:p-5">
//     <div class="mx-auto max-w-screen-lg pl-1 ml-60">
//         {/* <!-- Start coding here --> */}
//         <div class="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full absolute right-0 relative shadow-md sm:rounded-lg overflow-hidden">
//             <div class="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
//                 <div class="w-full md:w-1/2">
//                     <form class="flex items-center">
//                         <label for="simple-search" class="sr-only">Search</label>
//                         <div class="relative w-full">
//                             <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//                                 <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                     <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
//                                 </svg>
//                             </div>
//                             <input type="text" id="simple-search" class="bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Search" required=""/>
//                         </div>
//                     </form>
//                 </div>
//                 <div class="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
//                     <button type="button" class="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800">
//                         <svg class="h-3.5 w-3.5 mr-2" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
//                             <path clip-rule="evenodd" fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
//                         </svg>
//                         Add product
//                     </button>
//                     <div class="flex items-center space-x-3 w-full md:w-auto">
//                         <button id="actionsDropdownButton" data-dropdown-toggle="actionsDropdown" class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
//                             <svg class="-ml-1 mr-1.5 w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
//                                 <path clip-rule="evenodd" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
//                             </svg>
//                             Actions
//                         </button>
//                         <div id="actionsDropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                             <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="actionsDropdownButton">
//                                 <li>
//                                     <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Mass Edit</a>
//                                 </li>
//                             </ul>
//                             <div class="py-1">
//                                 <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete all</a>
//                             </div>
//                         </div>
//                         <button id="filterDropdownButton" data-dropdown-toggle="filterDropdown" class="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700" type="button">
//                             <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="h-4 w-4 mr-2 text-gray-400" viewbox="0 0 20 20" fill="currentColor">
//                                 <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
//                             </svg>
//                             Filter
//                             <svg class="-mr-1 ml-1.5 w-5 h-5" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
//                                 <path clip-rule="evenodd" fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
//                             </svg>
//                         </button>
//                         <div id="filterDropdown" class="z-10 hidden w-48 p-3 bg-white rounded-lg shadow dark:bg-gray-700">
//                             <h6 class="mb-3 text-sm font-medium text-gray-900 dark:text-white">Choose brand</h6>
//                             <ul class="space-y-2 text-sm" aria-labelledby="filterDropdownButton">
//                                 <li class="flex items-center">
//                                     <input id="apple" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
//                                     <label for="apple" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Apple (56)</label>
//                                 </li>
//                                 <li class="flex items-center">
//                                     <input id="fitbit" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
//                                     <label for="fitbit" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Microsoft (16)</label>
//                                 </li>
//                                 <li class="flex items-center">
//                                     <input id="razor" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
//                                     <label for="razor" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Razor (49)</label>
//                                 </li>
//                                 <li class="flex items-center">
//                                     <input id="nikon" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
//                                     <label for="nikon" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">Nikon (12)</label>
//                                 </li>
//                                 <li class="flex items-center">
//                                     <input id="benq" type="checkbox" value="" class="w-4 h-4 bg-gray-100 border-gray-300 rounded text-primary-600 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"/>
//                                     <label for="benq" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-100">BenQ (74)</label>
//                                 </li>
//                             </ul>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             <div class="overflow-x-auto">
//                 <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
//                     <thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
//                         <tr>
//                             <th scope="col" class="px-4 py-3">Product name</th>
//                             <th scope="col" class="px-4 py-3">Category</th>
//                             <th scope="col" class="px-4 py-3">Brand</th>
//                             <th scope="col" class="px-4 py-3">Description</th>
//                             <th scope="col" class="px-4 py-3">Price</th>
//                             <th scope="col" class="px-4 py-3">
//                                 <span class="sr-only">Actions</span>
//                             </th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Apple iMac 27&#34;</th>
//                             <td class="px-4 py-3">PC</td>
//                             <td class="px-4 py-3">Apple</td>
//                             <td class="px-4 py-3">300</td>
//                             <td class="px-4 py-3">$2999</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="apple-imac-27-dropdown-button" data-dropdown-toggle="apple-imac-27-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="apple-imac-27-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="apple-imac-27-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Apple iMac 20&#34;</th>
//                             <td class="px-4 py-3">PC</td>
//                             <td class="px-4 py-3">Apple</td>
//                             <td class="px-4 py-3">200</td>
//                             <td class="px-4 py-3">$1499</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="apple-imac-20-dropdown-button" data-dropdown-toggle="apple-imac-20-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="apple-imac-20-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="apple-imac-20-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Apple iPhone 14</th>
//                             <td class="px-4 py-3">Phone</td>
//                             <td class="px-4 py-3">Apple</td>
//                             <td class="px-4 py-3">1237</td>
//                             <td class="px-4 py-3">$999</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="apple-iphone-14-dropdown-button" data-dropdown-toggle="apple-iphone-14-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="apple-iphone-14-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="apple-iphone-14-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Apple iPad Air</th>
//                             <td class="px-4 py-3">Tablet</td>
//                             <td class="px-4 py-3">Apple</td>
//                             <td class="px-4 py-3">4578</td>
//                             <td class="px-4 py-3">$1199</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="apple-ipad-air-dropdown-button" data-dropdown-toggle="apple-ipad-air-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="apple-ipad-air-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="apple-ipad-air-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Xbox Series S</th>
//                             <td class="px-4 py-3">Gaming/Console</td>
//                             <td class="px-4 py-3">Microsoft</td>
//                             <td class="px-4 py-3">56</td>
//                             <td class="px-4 py-3">$299</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="xbox-series-s-dropdown-button" data-dropdown-toggle="xbox-series-s-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="xbox-series-s-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="xbox-series-s-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">PlayStation 5</th>
//                             <td class="px-4 py-3">Gaming/Console</td>
//                             <td class="px-4 py-3">Sony</td>
//                             <td class="px-4 py-3">78</td>
//                             <td class="px-4 py-3">$799</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="playstation-5-dropdown-button" data-dropdown-toggle="playstation-5-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="playstation-5-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="playstation-5-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Xbox Series X</th>
//                             <td class="px-4 py-3">Gaming/Console</td>
//                             <td class="px-4 py-3">Microsoft</td>
//                             <td class="px-4 py-3">200</td>
//                             <td class="px-4 py-3">$699</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="xbox-series-x-dropdown-button" data-dropdown-toggle="xbox-series-x-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="xbox-series-x-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="xbox-series-x-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Apple Watch SE</th>
//                             <td class="px-4 py-3">Watch</td>
//                             <td class="px-4 py-3">Apple</td>
//                             <td class="px-4 py-3">657</td>
//                             <td class="px-4 py-3">$399</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="apple-watch-se-dropdown-button" data-dropdown-toggle="apple-watch-se-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="apple-watch-se-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="apple-watch-se-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">NIKON D850</th>
//                             <td class="px-4 py-3">Photo</td>
//                             <td class="px-4 py-3">Nikon</td>
//                             <td class="px-4 py-3">465</td>
//                             <td class="px-4 py-3">$599</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="nikon-d850-dropdown-button" data-dropdown-toggle="nikon-d850-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="nikon-d850-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="nikon-d850-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                         <tr class="border-b dark:border-gray-700">
//                             <th scope="row" class="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">Monitor BenQ EX2710Q</th>
//                             <td class="px-4 py-3">TV/Monitor</td>
//                             <td class="px-4 py-3">BenQ</td>
//                             <td class="px-4 py-3">354</td>
//                             <td class="px-4 py-3">$499</td>
//                             <td class="px-4 py-3 flex items-center justify-end">
//                                 <button id="benq-ex2710q-dropdown-button" data-dropdown-toggle="benq-ex2710q-dropdown" class="inline-flex items-center p-0.5 text-sm font-medium text-center text-gray-500 hover:text-gray-800 rounded-lg focus:outline-none dark:text-gray-400 dark:hover:text-gray-100" type="button">
//                                     <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                         <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
//                                     </svg>
//                                 </button>
//                                 <div id="benq-ex2710q-dropdown" class="hidden z-10 w-44 bg-white rounded divide-y divide-gray-100 shadow dark:bg-gray-700 dark:divide-gray-600">
//                                     <ul class="py-1 text-sm text-gray-700 dark:text-gray-200" aria-labelledby="benq-ex2710q-dropdown-button">
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Show</a>
//                                         </li>
//                                         <li>
//                                             <a href="#" class="block py-2 px-4 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white">Edit</a>
//                                         </li>
//                                     </ul>
//                                     <div class="py-1">
//                                         <a href="#" class="block py-2 px-4 text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">Delete</a>
//                                     </div>
//                                 </div>
//                             </td>
//                         </tr>
//                     </tbody>
//                 </table>
//             </div>
//             <nav class="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0 p-4" aria-label="Table navigation">
//                 <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
//                     Showing
//                     <span class="font-semibold text-gray-900 dark:text-white">1-10</span>
//                     of
//                     <span class="font-semibold text-gray-900 dark:text-white">1000</span>
//                 </span>
//                 <ul class="inline-flex items-stretch -space-x-px">
//                     <li>
//                         <a href="#" class="flex items-center justify-center h-full py-1.5 px-3 ml-0 text-gray-500 bg-white rounded-l-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
//                             <span class="sr-only">Previous</span>
//                             <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                 <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
//                             </svg>
//                         </a>
//                     </li>
//                     <li>
//                         <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">1</a>
//                     </li>
//                     <li>
//                         <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">2</a>
//                     </li>
//                     <li>
//                         <a href="#" aria-current="page" class="flex items-center justify-center text-sm z-10 py-2 px-3 leading-tight text-primary-600 bg-primary-50 border border-primary-300 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">3</a>
//                     </li>
//                     <li>
//                         <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">...</a>
//                     </li>
//                     <li>
//                         <a href="#" class="flex items-center justify-center text-sm py-2 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">100</a>
//                     </li>
//                     <li>
//                         <a href="#" class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white rounded-r-lg border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
//                             <span class="sr-only">Next</span>
//                             <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
//                                 <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
//                             </svg>
//                         </a>
//                     </li>
//                 </ul>
//             </nav>
//         </div>
//     </div>
//     </section></div>
//   )
// }

// export default DocumentDataTable