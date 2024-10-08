import React, { useState, useEffect } from 'react';
import LoadingBar from '../loadingbar/LoadingBar';
import './DataTable.css';

function DocumentDataTable({ claimId, onViewDocument, onReadDocument }) {
  const [documents, setDocuments] = useState([]);
  const [file, setFile] = useState(null);
  const [files, setFiles] = useState([]);
  const [fileName, setFileName] = useState('');
  const [isFileSelected, setIsFileSelected] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [category, setCategory] = useState('');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [fileNames, setFileNames] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingMultiple, setIsEditingMultiple] = useState(false);
  const [editedDocuments, setEditedDocuments] = useState({});
  const [loading, setLoading] = useState(false); // Loading state added
  const [showLoadingBar, setShowLoadingBar] = useState(false); // State to manage loading bar
  const [showModal, setShowModal] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);



const [documentToDelete, setDocumentToDelete] = useState(null);


  useEffect(() => {
    fetchDocuments();
  }, [claimId]);

  const fetchDocuments = async () => {
    setLoading(true); // Start loading
    try {
      const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`);
      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await res.json();
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
    } finally {
      setLoading(false); // End loading
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
    formData.append('category', category);
    formData.append('claimId', claimId);

    try {
      setLoading(true); // Start loading
      const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        await fetchDocuments(); // Refresh the document list after upload
        setIsFileSelected(false); // Reset file selection
        setFile(null);
        setFileName(''); // Reset file name input
        setCategory('');
      } else {
        console.error('Upload failed');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false); // End loading
    }
  };

  const onBulkFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const initialFileNames = {};
    selectedFiles.forEach(file => {
      initialFileNames[file.name] = file.name; // Initialize with original filenames
    });
    setFileNames(initialFileNames);
  };

  const onBulkUploadSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();

    files.forEach(file => {
      formData.append('documents', file, fileNames[file.name]); // Use the edited filename
    });
    formData.append('category', category);
    formData.append('claimId', claimId);

    try {
      setShowLoadingBar(true); // Show the loading bar

      const res = await fetch(`http://localhost:4000/dms/bulk-upload`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const result = await res.json();

        setTimeout(() => {
          setShowLoadingBar(false); // Hide the loading bar after 1.2 seconds
          fetchDocuments(); // Reload the document data
        }, 80); // 1.2 seconds delay before reloading the table

      } else {
        console.error('Bulk upload failed');
        setShowLoadingBar(false); // Hide the loading bar on error
      }
    } catch (err) {
      console.error(err);
      setShowLoadingBar(false); // Hide the loading bar on error
    }
  };

  const handleViewDocument = (fileUrl, documentId) => {
    setSelectedDocumentId(documentId);
    if (onViewDocument) {
      onViewDocument(fileUrl, documentId);
    }
  };
  const handleReadDocument = async (documentId) => {
    try {
      const res = await fetch(`http://localhost:4000/new/claims/${claimId}/documents/${documentId}`);
      if (!res.ok) {
        throw new Error('Failed to fetch document details');
      }
      const document = await res.json();

      // Send the document to the OCR route
      const ocrRes = await fetch(`http://localhost:4000/new/ocr/read/${documentId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileUrl: document.fileUrl, mimetype: document.mimetype })
      });
      if (!ocrRes.ok) {
        throw new Error('Failed to fetch OCR text');
      }
      const data = await ocrRes.json();
      onReadDocument(data.text);
    } catch (err) {
      console.error('Error reading document:', err);
    }
  };

  const handleDownloadDocument = (fileUrl) => {
    try {
      console.log(`Initiating download for file: ${fileUrl}`);

      // Create a link element
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = ''; // This attribute will prompt the browser to download the file
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      console.log(`File download triggered for URL: ${fileUrl}`);
    } catch (err) {
      console.error('Error initiating download:', err);
    }
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // Clone the current documents' state when entering edit mode
      const clonedDocuments = documents.reduce((acc, doc) => {
        acc[doc._id] = { fileName: doc.fileName, category: doc.category };
        return acc;
      }, {});
      setEditedDocuments(clonedDocuments);
    }
  };

  const handleRowClick = (documentId) => {
    setSelectedDocumentId(documentId);
  };

  const handleEditMultipleClick = () => {
    setIsEditingMultiple(!isEditingMultiple);
    if (!isEditingMultiple) {
      const clonedDocuments = documents.reduce((acc, doc) => {
        acc[doc._id] = { fileName: doc.fileName, category: doc.category };
        return acc;
      }, {});
      setEditedDocuments(clonedDocuments);
    }
  };

  const handleInputChange = (id, field, value) => {
    setEditedDocuments({
      ...editedDocuments,
      [id]: { ...editedDocuments[id], [field]: value },
    });
  };

  const handleSave = async () => {
    try {
      setLoading(true); // Start loading
      // Iterate over the edited documents and send update requests
      for (const [id, updatedData] of Object.entries(editedDocuments)) {
        await fetch(`http://localhost:4000/new/claims/${claimId}/documents/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedData),
        });
      }

      setIsEditing(false);
      fetchDocuments(); // Refresh the document list after saving
    } catch (err) {
      console.error('Error saving edits:', err);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleSaveMultiple = async () => {
    try {
      setLoading(true); // Start loading
      await fetch(`http://localhost:4000/new/claims/${claimId}/documents`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(Object.values(editedDocuments)),
      });

      setIsEditingMultiple(false);
      fetchDocuments(); // Refresh the document list after saving
    } catch (err) {
      console.error('Error saving edits:', err);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleDeleteClick = (docId) => {
    setDocumentToDelete(docId); // Set the document ID to be deleted
    setShowModal(true); // Show the confirmation modal
  };
  
  const handleConfirmDelete = async () => {
    try {
      setLoading(true); // Start loading
      await fetch(`http://localhost:4000/new/claims/${claimId}/documents/${documentToDelete}`, {
        method: 'DELETE',
      });
  
      setShowModal(false); // Close the modal
      setDocumentToDelete(null); // Clear the document to delete
      fetchDocuments(); // Refresh the document list after deletion
      // window.location.reload()
    } catch (err) {
      console.error('Error deleting document:', err);
    } finally {
      setLoading(false); // End loading
    }
  };
  
  const handleCancelDelete = () => {
    setShowModal(false); // Close the modal
    setDocumentToDelete(null); // Clear the document to delete
  };
  

  const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];

  return (
    <div>
      {showLoadingBar ? (
        <LoadingBar /> // Display the loading bar
      ) : (
        <section className="ml-60 bg-slate-900 dark:bg-gray-900 p-4">
          <div className="ml-2 p-2">
            <div className="bg-gradient-to-b from-slate-400 via-purple-400 to-slate-400 dark:bg-gray-800 w-full shadow-md sm:rounded-lg overflow-hidden">
              <div className="space-y-3 md:space-y-0 md:space-x-4 p-4">
                <div className="md:w-1/2">
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

                  {/* Bulk Upload Button */}
                  <button
                    className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
                    onClick={() => setShowBulkUpload(!showBulkUpload)}
                  >
                    + Bulk Upload
                  </button>
                  <button
                    className="flex items-center justify-center text-white bg-blue-200 focus:ring-4 focus:ring-blue-800 font-medium rounded-lg text-sm px-4 py-2"
                    onClick={handleEditClick}
                  >
                    Edit
                  </button>
                  {isEditingMultiple && (
                    <button
                      className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2"
                      onClick={handleSaveMultiple}
                    >
                      Save Changes
                    </button>
                  )}
                  {isEditing && (
                    <button
                      className="flex items-center justify-center text-white bg-orange-500 hover:bg-orange-600 focus:ring-4 focus:ring-orange-300 font-medium rounded-lg text-sm px-4 py-2"
                      onClick={handleSave}
                    >
                      Save Changes
                    </button>
                  )}
                </div>
              </div>

              {/* Bulk Upload Form */}
              {showBulkUpload && (
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mt-4">
                  <form onSubmit={onBulkUploadSubmit}>
                    <input
                      type="file"
                      multiple
                      onChange={onBulkFileChange}
                      required
                      className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 dark:bg-gray-700 dark:border-gray-600 focus:outline-none"
                    />
                    {files.map(file => (
                      <div key={file.name} className="flex items-center space-x-3 mt-2">
                        <input
                          type="text"
                          value={fileNames[file.name] || ''}
                          onChange={(e) => setFileNames({
                            ...fileNames,
                            [file.name]: e.target.value
                          })}
                          placeholder="Edit file name"
                          className="px-3 py-2 border border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                          required
                        />
                      </div>
                    ))}
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-2 bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat, index) => (
                        <option key={index} value={cat}>{cat}</option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="mt-2 w-full text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
                    >
                      Upload Files
                    </button>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 w-full">
                    <tr>
                      <th scope="col" className="px-4 py-3">Document Name</th>
                      <th scope="col" className="px-4 py-3">Date Uploaded</th>
                      <th scope="col" className="px-4 py-3">Uploader</th>
                      <th scope="col" className="px-4 py-3">View File</th>
                      <th scope="col" className="px-4 py-3">Save File</th>
                      <th scope="col" className="px-4 py-3">Category</th>
                      <th scope="col" className="px-4 py-3">Remove File</th>
                    </tr>
                  </thead>
                  <tbody>
  {documents.map((doc) => (
    <tr 
      key={doc._id}
      className={`document-row ${selectedDocumentId === doc._id ? 'document-row-selected' : ''}`}
      onClick={() => handleRowClick(doc._id)}
      style={{
        transition: 'background-color 0.2s ease-in-out',
        cursor: 'pointer'
      }}
    >
      <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
        {(isEditing || isEditingMultiple) ? (
          <input
            type="text"
            value={editedDocuments[doc._id]?.fileName || doc.fileName}
            onChange={(e) => handleInputChange(doc._id, 'fileName', e.target.value)}
            className="px-2 py-1 border rounded-md"
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          doc.fileName
        )}
      </th>
      <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
      <td className="px-4 py-3">Uploaded Document</td>
      <td className="px-4 py-3">
        <a href="#" onClick={(e) => { e.stopPropagation(); handleViewDocument(doc.fileUrl, doc._id); }}>View</a>
      </td>
      <td className="px-4 py-3">
        <a href="#" onClick={(e) => { e.stopPropagation(); handleDownloadDocument(doc.fileUrl); }}>Download</a>
      </td>
      <td className="px-4 py-3">
        {(isEditing || isEditingMultiple) ? (
          <select
            value={editedDocuments[doc._id]?.category || doc.category}
            onChange={(e) => handleInputChange(doc._id, 'category', e.target.value)}
            className="px-2 py-1 border rounded-md"
            onClick={(e) => e.stopPropagation()}
          >
            {categories.map((cat, index) => (
              <option key={index} value={cat}>{cat}</option>
            ))}
          </select>
        ) : (
          doc.category
        )}
      </td>
      <td className="px-4 py-3">
        <a href="#" onClick={(e) => { e.stopPropagation(); handleDeleteClick(doc._id); }}>Delete</a>
      </td>
    </tr>
  ))}
</tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

{showModal && (
  <div id="popup-modal" tabIndex="-1" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="relative p-4 w-full max-w-md max-h-full">
      <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <button type="button" className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={handleCancelDelete}>
          <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l-6-6M7 7l-6 6"/>
          </svg>
          <span className="sr-only">Close modal</span>
        </button>
        <div className="p-4 md:p-5 text-center">
          <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
          </svg>
          <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this document?</h3>
          <button onClick={handleConfirmDelete} type="button" className="text-white bg-red-600 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-red-300 dark:focus:ring-red-800 font-medium rounded-lg text-sm inline-flex items-center px-5 py-2.5 text-center">
            Yes, I'm sure
          </button>
          <button onClick={handleCancelDelete} type="button" className="py-2.5 px-5 ms-3 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">
            No, cancel
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}

export default DocumentDataTable;
//                       />
//                     </div>
//                   ))}
//                   <select
//                     value={category}
//                     onChange={(e) => setCategory(e.target.value)}
//                     className="mt-2 bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//                     required
//                   >
//                     <option value="">Select Category</option>
//                     {categories.map((cat, index) => (
//                       <option key={index} value={cat}>{cat}</option>
//                     ))}
//                   </select>
//                   <button
//                     type="submit"
//                     className="mt-2 w-full text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
//                   >
//                     Upload Files
//                   </button>
//                 </form>
//               </div>
//             )}
//             <div className="overflow-x-auto">
//               <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
//                 <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 w-full">
//                   <tr>
//                     <th scope="col" className="px-4 py-3">Document Name</th>
//                     <th scope="col" className="px-4 py-3">Date Uploaded</th>
//                     <th scope="col" className="px-4 py-3">Uploader</th>
//                     <th scope="col" className="px-4 py-3">View File</th>
//                     <th scope="col" className="px-4 py-3">Save File</th>
//                     <th scope="col" className="px-4 py-3">Category</th>
//                     {/* <th scope="col" className="px-4 py-3">Edit</th> */}
                   
//                     {/* <th scope="col" className="px-4 py-3">
//                       <select
//                         id="category-header"
//                         value={categoryFilter}
//                         onChange={(e) => setCategoryFilter(e.target.value)}
//                         className="bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
//                       >
//                         <option value="">All Categories</option>
//                         {categories.map((category, index) => (
//                           <option key={index} value={category}>{category}</option>
//                         ))}
//                       </select> */}
//                     {/* </th> */}
//                   </tr>
//                 </thead>

//                {/* <div>
//                 <tbody>
//                   {documents.map((doc) => (
//                     <tr key={doc._id} className="border-b dark:border-gray-700">
//                       <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                         {doc.fileName}
//                       </th>
//                       <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
//                       <td className="px-4 py-3">Uploaded Document</td>
//                       <td className="px-4 py-3"><a href="#" onClick={() => handleViewDocument(doc.fileUrl)}>View</a></td>
//                       <td className="px-4 py-3"><a href="#" onClick={() => handleDownloadDocument(doc.fileUrl)}>Download</a></td>
//                       {/* <td className="px-4 py-3"><a href="#" onClick={()=> handleReadDocument(doc._id)} >Read</a></td> */}
//                       {/* <td className="px-4 py-3">{doc.category}</td> */}
//                       {/* <td className="px-4 py-3">Edit File</td> */}
//                     {/* </tr> */}
//                   {/* ))}
//                 </tbody> */}
//                  <tbody>
//                   {documents.map((doc) => (
//                     <tr 
//                       key={doc._id} // Use _id or whatever unique identifier your documents have
//                       className={`document-row ${selectedDocumentId === doc._id ? 'document-row-selected' : ''}`}
//                       onClick={() => handleRowClick(doc._id)}
//                       style={{
//                         transition: 'background-color 0.2s ease-in-out',
//                         cursor: 'pointer'
//                       }}
//                     >
//                       <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
//                         {doc.fileName}
//                       </th>
//                       <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
//                       <td className="px-4 py-3">Uploaded Document</td>
//                       <td className="px-4 py-3">
//                         <a href="#" onClick={(e) => { e.stopPropagation(); handleViewDocument(doc.fileUrl, doc._id); }}>View</a>
//                       </td>
//                       <td className="px-4 py-3">
//                         <a href="#" onClick={(e) => { e.stopPropagation(); handleDownloadDocument(doc.fileUrl); }}>Download</a>
//                       </td>
//                       <td className="px-4 py-3">{doc.category}</td>
//                       <td className="px-4 py-3">
//                         <a href="#" onClick={(e) => { e.stopPropagation(); handleDeleteClick(doc._id); }}>Delete</a>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>

//               </table>
//             </div>
//           </div>
//         </div>
//       </section>
//   </div>
//   );
// }

// export default DocumentDataTable;




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