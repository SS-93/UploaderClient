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
    // Log file names before appending to formData
    console.log('Files to be uploaded:', files.map(file => file.name));

    files.forEach(file => {
      formData.append('documents', file);
    });
    formData.append('category', category);

    try {
      setShowLoadingBar(true);
      // Update the route to use the claims endpoint for bulk upload
      const res = await fetch(`http://localhost:4000/new/claims/${claimId}/bulk-upload`, {
        method: 'POST',
        body: formData,
      });

      // const res = await fetch(`http://localhost:4000/dms/bulk-upload` , {
      //   method: 'POST',
      //   body: formData,
      // });

      if (res.ok) {
        const result = await res.json();
        console.log('Bulk upload successful:', result);

        setTimeout(() => {
          setShowLoadingBar(false);
          fetchDocuments();
        }, 80);

      } else {
        const errorData = await res.json();
        console.error('Bulk upload failed:', errorData);
        setShowLoadingBar(false);
      }
    } catch (err) {
      console.error('Error during bulk upload:', err);
      setShowLoadingBar(false);
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