import React, { useState, useEffect } from 'react';
import LoadingBar from '../../loadingbar/LoadingBar';
import DocumentViewer from '../../documentviewer/DocumentViewer';
import TextModule from '../../textmodule/TextModule';
import './DashboardII.css'


function DocumentDashboard({ claimId, parkId, onViewDocument, onReadDocument, parkSessionId }) {
  const [documents, setDocuments] = useState([]);
  const [fetchedDocuments, setFetchedDocuments] = useState([]);
  const [parkedDocuments, setParkedDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDocuments, setEditedDocuments] = useState({});
  const [newDocuments, setNewDocuments] = useState([]);
  const [documentDetails, setDocumentDetails] = useState([]);
  const [showLoadingBar, setShowLoadingBar] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [isEditingMultiple, setIsEditingMultiple] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [trueId, setTrueId] = useState(null);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);

  
  const categories = ["Correspondence General", "First Notice of Loss", "Invoice", "Legal", "Medicals", "Wages", "Media"];

  useEffect(() => {
    fetchNewlyUploadedDocuments();
    if (parkId) {
      fetchParkedDocuments();
    }
    if (parkSessionId) {
      fetchParkingSessionDocuments();
    }
  }, [parkId, parkSessionId]);

  const fetchNewlyUploadedDocuments = async () => {
    try {
      const response = await fetch('http://localhost:4000/dms/recent-uploads');
      if (response.ok) {
        const result = await response.json();
        // Use a Set to ensure uniqueness based on OcrId
        const uniqueDocuments = Array.from(new Set(result.files.map(doc => doc.OcrId)))
          .map(OcrId => result.files.find(doc => doc.OcrId === OcrId));
        setDocuments(uniqueDocuments);
      } else {
        console.error('Failed to fetch newly uploaded documents');
      }
    } catch (error) {
      console.error('Error fetching newly uploaded documents:', error);
    }
  };

  const fetchParkedDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`);
      if (!res.ok) throw new Error('Failed to fetch parked documents');
      const data = await res.json();
      setParkedDocuments(data.files);
      setDocuments(prevDocuments => {
        const newDocIds = new Set(data.files.map(doc => doc.OcrId));
        return [...prevDocuments.filter(doc => !newDocIds.has(doc.OcrId)), ...data.files];
      });
    } catch (err) {
      console.error('Error fetching parked documents:', err);
    }
  };

  const fetchParkingSessionDocuments = async () => {
    try {
      const res = await fetch(`http://localhost:4000/dms/park-sessions/${parkSessionId}/documents`);
      if (!res.ok) throw new Error('Failed to fetch parking session documents');
      const data = await res.json();
      setParkedDocuments(data.files);
      setDocuments(prevDocuments => {
        const newDocIds = new Set(data.files.map(doc => doc.OcrId));
        return [...prevDocuments.filter(doc => !newDocIds.has(doc.OcrId)), ...data.files];
      });
    } catch (err) {
      console.error('Error fetching parking session documents:', err);
    }
  };

  const handleEditClick = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      const editableDocuments = documents.reduce((acc, doc) => {
        acc[doc.OcrId] = { fileName: doc.fileName, category: doc.category || 'Uncategorized' };
        return acc;
      }, {});
      setEditedDocuments(editableDocuments);
    } else {
      setEditedDocuments({});
    }
  };

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    const newDocs = files.map(file => ({
      file,
      fileName: file.name,
      category: ''
    }));
    setNewDocuments(newDocs);
  };

  const handleNewDocumentChange = (index, field, value) => {
    const updatedNewDocuments = [...newDocuments];
    updatedNewDocuments[index][field] = value;
    setNewDocuments(updatedNewDocuments);
  };

  const onBulkUploadSubmit = async (event) => {
    event.preventDefault();
    setShowLoadingBar(true);

    const formData = new FormData();
    newDocuments.forEach((doc, index) => {
      formData.append('documents', doc.file);
      formData.append(`fileName${index}`, doc.fileName);
      formData.append(`category${index}`, doc.category);
    });

    if (parkId) {
      formData.append('parkId', parkId);
    }

    try {
      const response = await fetch('http://localhost:4000/dms/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Bulk upload successful:', result);
        setNewDocuments([]);
        setShowBulkUpload(false);
        await fetchNewlyUploadedDocuments();
        if (parkId) await fetchParkedDocuments();
      } else {
        console.error('Bulk upload failed');
        alert('Failed to upload files');
      }
    } catch (error) {
      console.error('Error during bulk upload:', error);
      alert('Error uploading files');
    } finally {
      setShowLoadingBar(false);
    }
  };

  const handleInputChange = (OcrId, field, value) => {
    setEditedDocuments(prev => ({
      ...prev,
      [OcrId]: {
        ...prev[OcrId],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const updates = Object.entries(editedDocuments).map(([OcrId, updatedData]) => ({
        OcrId,
        ...updatedData,
      }));
  
      for (const update of updates) {
        const response = await fetch(`http://localhost:4000/dms/documents/${update.OcrId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(update),
        });
  
        if (!response.ok) {
          throw new Error(`Failed to update document with OcrId ${update.OcrId}`);
        }
      }
  
      // Update the documents state with the edited changes
      setDocuments(prevDocuments => 
        prevDocuments.map(doc => {
          if (editedDocuments[doc.OcrId]) {
            return { ...doc, ...editedDocuments[doc.OcrId] };
          }
          return doc;
        })
      );
  
      setIsEditing(false);
      setEditedDocuments({});
    } catch (err) {
      console.error('Error saving edits:', err);
      alert(`Failed to save changes: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (documentId) => {
    setSelectedDocumentId(documentId);
  };
  const handleViewDocument = (fileUrl, documentId) => {
    if (onViewDocument) {
      onViewDocument(fileUrl, documentId);
    }
  };

  const handleDeleteClick = (OcrId) => {
    setDocumentToDelete(OcrId);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      const response = await (`http://localhost:4000/dms/documents/${documentToDelete}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNewlyUploadedDocuments();
        if (parkId) fetchParkedDocuments();
        if (parkSessionId) fetchParkingSessionDocuments();
        setShowModal(false);
        setDocumentToDelete(null);
      } else {
        throw new Error('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert(`Failed to delete document: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowModal(false);
    setDocumentToDelete(null);
  };

  const handleSortDocuments = async (OcrId) => {
    try {
      const res = await fetch(`http://localhost:4000/dms/move-document/${claimId}/${OcrId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (res.ok) {
        fetchNewlyUploadedDocuments();
        if (parkId) fetchParkedDocuments();
        if (parkSessionId) fetchParkingSessionDocuments();
        alert('Document sorted successfully');
      } else {
        const errorData = await res.json();
        throw new Error(`Failed to sort document: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Error sorting document:', err);
      alert(`Failed to sort document: ${err.message}`);
    }
  };

  const handleDownloadDocument = async (fileUrl) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'document';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document');
    }
  };

  const allDocuments = [...documents, ...fetchedDocuments, ...parkedDocuments];

  return (
    <div>
      {showLoadingBar ? (
        <LoadingBar />
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
                    {isEditing ? 'Cancel' : 'Edit'}
                  </button>
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

              {showBulkUpload && (
                <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded-lg mt-4">
                  <form onSubmit={onBulkUploadSubmit}>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileChange}
                      className="mb-2 bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    />
                    {newDocuments.map((doc, index) => (
                      <div key={index} className="mb-2">
                        <input
                          type="text"
                          value={doc.fileName}
                          onChange={(e) => handleNewDocumentChange(index, 'fileName', e.target.value)}
                          placeholder="File Name"
                          className="mb-2 bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                        />
                        <select
                          value={doc.category}
                          onChange={(e) => handleNewDocumentChange(index, 'category', e.target.value)}
                          className="mt-2 bg-gray-50 border border-gray-300 text-slate-600 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-3 p-2 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                          required
                        >
                          <option value="">Select Category</option>
                          {categories.map((cat, idx) => (
                            <option key={idx} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    ))}
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
                      <th scope="col" className="px-4 py-3">Sort File</th>
                    </tr>
                  </thead>
                  <tbody>
                {allDocuments.map((doc) => (
                  <tr 
                    key={doc.OcrId}
                    className={`document-row ${selectedDocumentId === doc.OcrId ? 'document-row-selected' : ''}`}
                    onClick={() => handleRowClick(doc.OcrId)}
                    style={{
                      transition: 'background-color 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                  >
                    <th scope="row" className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                      {(isEditing || isEditingMultiple) ? (
                        <input
                          type="text"
                          value={editedDocuments[doc.OcrId]?.fileName || doc.fileName}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleInputChange(doc.OcrId, 'fileName', e.target.value);
                          }}
                          className="px-2 py-1 border rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        doc.fileName || 'Unnamed Document'
                      )}
                    </th>
                    <td className="px-4 py-3">{new Date(doc.uploadDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">Uploaded Document</td>
                    <td className="px-4 py-3">
                      <a href="#" onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        onViewDocument(doc.fileUrl, doc.OcrId); 
                      }}>View</a>
                    </td>
                    <td className="px-4 py-3">
                      <a href="#" onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        handleDownloadDocument(doc.fileUrl); 
                      }}>Download</a>
                    </td>
                    <td className="px-4 py-3">
                      {(isEditing || isEditingMultiple) ? (
                        <select
                          value={editedDocuments[doc.OcrId]?.category || doc.category}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleInputChange(doc.OcrId, 'category', e.target.value);
                          }}
                          className="px-2 py-1 border rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {categories.map((cat, index) => (
                            <option key={index} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        doc.category || 'Uncategorized'
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <a href="#" onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        handleDeleteClick(doc.OcrId); 
                      }}>Delete</a>
                    </td>
                    <td className="px-4 py-3">
                      <a href="#" onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        handleSortDocuments(doc.OcrId); 
                      }}>Sort</a>
                    </td>
                  </tr>
                ))}
              </tbody>s
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
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
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

export default DocumentDashboard;