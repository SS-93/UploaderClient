import React, { useState, useEffect, useCallback } from 'react';
import LoadingBar from '../../loadingbar/LoadingBar';
import DocumentViewer from '../../documentviewer/DocumentViewer';
import TextModule from '../../textmodule/TextModule';
import './DashboardII.css'
import PropTypes from 'prop-types';
import SuggestedClaims from '../../suggestedclaims/SuggestedClaims';
import { findMatchingClaims } from '../../../utils/matchingLogic';
import SingleDocumentProcessor from '../../singledocumentprocessor/SingleDocumentProcessor';

function DocumentDashboard({ claimId, parkId, onViewDocument, onReadDocument, parkSessionId, onSelectDocument, onSelectDocumentII, onSelectionChange, processingEnabled, selectedDocuments = [], setSelectedDocuments, onBulkSortComplete, aiMatchResults, sortResults, onProcess, onSaveOcrText }) {
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
  const [showMatchHistory, setShowMatchHistory] = useState(false);
  const [selectedDocMatchHistory, setSelectedDocMatchHistory] = useState(null);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [matchResults, setMatchResults] = useState({});
  const [documentMatchResults, setDocumentMatchResults] = useState({});

  
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


  // const handleRowClick = (documentId) => {
  //   setSelectedDocumentId(documentId);
  //   onSelectDocument(documentId); // Call the parent function to update OCR ID
  // };
  // Modify the existing row click handler to use handleDocumentSelect
  const handleRowClickII = async (document) => {
    setSelectedDocumentId(document.OcrId);
    
    try {
        // We fetch OCR text but we're not fetching match history here
        const response = await fetch(`http://localhost:4000/dms/ocr-text/${document.OcrId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch document details');
        }
        const fullDocument = await response.json();

        // We should also fetch match history here
        const matchHistoryResponse = await fetch(`http://localhost:4000/ai/match-history/${document.OcrId}`);
        if (!matchHistoryResponse.ok) {
            throw new Error('Failed to fetch match history');
        }
        const matchHistory = await matchHistoryResponse.json();

        const documentData = {
            OcrId: document.OcrId,
            textContent: fullDocument.textContent || document.textContent || '',
            fileName: document.fileName || fullDocument.fileName || 'Unnamed Document',
            category: document.category || fullDocument.category || 'Uncategorized',
            uploadDate: document.uploadDate || fullDocument.uploadDate || new Date().toISOString(),
            matchScore: document.matchScore || 0,
            suggestedClaims: document.suggestedClaims || [],
            entities: fullDocument.entities || {},
            matchResults: fullDocument.matchResults || [],
            // Add match history here
            matchHistory: matchHistory.matchHistory || [] // This was missing!
        };

        console.log('DocumentDashboard - Document clicked:', documentData);
        
        handleDocumentSelect(documentData);
        onSelectDocument(documentData);

    } catch (error) {
        console.error('Error preparing document data:', error);
        // Update fallback to include empty match history
        const fallbackData = {
            OcrId: document.OcrId,
            textContent: document.textContent || '',
            fileName: document.fileName || 'Unnamed Document',
            category: document.category || 'Uncategorized',
            uploadDate: document.uploadDate || new Date().toISOString(),
            matchScore: 0,
            suggestedClaims: [],
            matchHistory: [] // Add empty match history to fallback
        };
        handleDocumentSelect(fallbackData);
        onSelectDocument(fallbackData);
    }
};

  const handleViewDocument = (fileUrl, documentId) => {
    if (onViewDocument) {
      onViewDocument(fileUrl, documentId);
    }
  };

  const handleDeleteClick = (document) => {
    console.log('Document to delete:', document);
    setDocumentToDelete(document.OcrId);
    setShowModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) {
      console.error('No document selected for deletion');
      alert('No document selected for deletion');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/dms/documents/${documentToDelete}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete document');
      }

      const result = await response.json();
      console.log(result.message); // Log the success message
      
      // Update the documents state to remove the deleted document
      setDocuments(prevDocuments => prevDocuments.filter(doc => doc.OcrId !== documentToDelete));
      
      setShowModal(false);
      setDocumentToDelete(null);
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
        setLoading(true);
        const res = await fetch(`http://localhost:4000/dms/sort-document/${OcrId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || 'Failed to sort document');
        }

        const result = await res.json();
        console.log('Document sorted successfully:', result);
        
        // Refresh document lists
        await fetchNewlyUploadedDocuments();
        if (parkId) await fetchParkedDocuments();
        if (parkSessionId) await fetchParkingSessionDocuments();

        // Show success message
        alert(`Document sorted successfully to claim ${result.claimNumber}`);

    } catch (err) {
        console.error('Error sorting document:', err);
        alert(err.message);
    } finally {
        setLoading(false);
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

  const viewMatchHistory = async (OcrId, e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Requesting match history for OcrId: ${OcrId}`);
    try {
        const response = await fetch(`http://localhost:4000/match-history/${OcrId}`);
        if (!response.ok) throw new Error('Failed to fetch match history');
        const data = await response.json();
        console.log(`Match history received for OcrId: ${OcrId}`, data.matchHistory);
        setSelectedDocMatchHistory(data);
        setShowMatchHistory(true);
    } catch (error) {
        console.error('Error fetching match history:', error);
    }
};

  const handleSelectAll = (e) => {
    const newSelection = e.target.checked ? documents.map(doc => doc.OcrId) : [];
    setSelectedDocuments(newSelection);
    
    // Find full document objects for selected IDs
    const selectedDocs = documents.filter(doc => 
        newSelection.includes(doc.OcrId)
    );
    
    // Notify parent component of selection change
    onSelectionChange(selectedDocs);
  };

  const handleSelectDocument = (document) => {
    if (setSelectedDocuments) {
        const isSelected = selectedDocuments.some(doc => doc.OcrId === document.OcrId);
        if (isSelected) {
            setSelectedDocuments(selectedDocuments.filter(doc => doc.OcrId !== document.OcrId));
        } else {
            setSelectedDocuments([...selectedDocuments, document]);
        }
    }
    if (onSelectDocument) {
        onSelectDocument(document);
    }
  };

  const handleBulkSort = async (selectedIds) => {
    try {
      const response = await fetch('http://localhost:4000/dms/bulk-sort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          documentIds: selectedIds,
          autoSort: true,
          minScore: 75 // You might want to make this configurable
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Successfully sorted ${result.success.length} documents`);
        setSelectedDocuments([]); // Clear selection
        // Refresh your document list
        fetchNewlyUploadedDocuments();
      } else {
        throw new Error('Failed to sort documents');
      }
    } catch (error) {
      console.error('Error in bulk sort:', error);
      alert('Failed to sort documents: ' + error.message);
    }
  };

  const handleBulkDelete = async (selectedIds) => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} documents?`)) {
      try {
        const response = await fetch('http://localhost:4000/dms/bulk-delete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ documentIds: selectedIds }),
        });

        if (response.ok) {
          alert('Documents deleted successfully');
          setSelectedDocuments([]); // Clear selection
          // Refresh your document list
          fetchNewlyUploadedDocuments();
        } else {
          throw new Error('Failed to delete documents');
        }
      } catch (error) {
        console.error('Error in bulk delete:', error);
        alert('Failed to delete documents: ' + error.message);
      }
    }
  };

  const handleDocumentSelection = async (doc) => {
    const updatedDocs = selectedDocuments.includes(doc) 
        ? selectedDocuments.filter(d => d.OcrId !== doc.OcrId)
        : [...selectedDocuments, doc];
    
    setSelectedDocuments(updatedDocs);

    // Fetch match results for newly selected document
    if (!selectedDocuments.includes(doc)) {
        try {
            const response = await fetch(`http://localhost:4000/ai/match-history/${doc.OcrId}`);
            if (response.ok) {
                const results = await response.json();
                setMatchResults(prev => ({
                    ...prev,
                    [doc.OcrId]: results.matchResults
                }));
            }
        } catch (error) {
            console.error('Error fetching match results:', error);
        }
    }
  };

  const handleCheckboxChange = (e, document) => {
    const isChecked = e.target.checked;
    handleDocumentSelection(document, isChecked);
  };

  const handleSelectionChange = useCallback((selectedIds) => {
    const selectedDocs = documents.filter(doc => selectedIds.includes(doc.OcrId));
    setSelectedDocuments(selectedDocs);
    onSelectionChange?.(selectedDocs);
  }, [documents, onSelectionChange]);

  const handleDocumentForSuggestions = async (document) => {
    try {
        const normalizedDocument = {
            OcrId: document.OcrId,
            fileName: document.fileName || 'Untitled Document',
            category: document.category || 'Uncategorized',
            uploadDate: document.uploadDate || new Date().toISOString(),
            textContent: document.textContent || ''
        };

        // Call the parent's onSelectDocument with normalized data
        onSelectDocument?.(normalizedDocument);
    } catch (error) {
        console.error('Error processing document for suggestions:', error);
    }
  };

  // Use useEffect instead of direct calls
  useEffect(() => {
    if (selectedDocuments.length > 0 && processingEnabled) {
        selectedDocuments.forEach(doc => {
            handleDocumentForSuggestions(doc);
        });
    }
  }, [selectedDocuments, processingEnabled]);

  const handleDocumentClick = (document) => {
    if (!document.OcrId) {
        console.error('Document OcrId is undefined');
        return;
    }
    setSelectedDocuments(document);
  };

  useEffect(() => {
    if (selectedDocuments && selectedDocuments.OcrId) {
        console.log('AILab received document:', selectedDocuments);
        // Proceed with processing
    } else {
        console.error('Invalid document data:', selectedDocuments);
    }
  }, [selectedDocuments]);
  const handleDocumentSelect = async (document) => {
    console.log('📄 Document selected:', document);
    
    if (!document?.OcrId) {
        console.warn('⚠️ Selected document has no OcrId');
        return;
    }

    setLoading(true); // Assuming setIsProcessing was intended to be setLoading

    try {
        // Fetch OCR text
        const ocrResponse = await fetch(`http://localhost:4000/dms/ocr-text/${document.OcrId}`);
        
        if (!ocrResponse.ok) {
            throw new Error('Failed to fetch OCR text');
        }
        
        const ocrData = await ocrResponse.json();

        // Fetch match history
        const matchResponse = await fetch(`http://localhost:4000/ai/match-history/${document.OcrId}`);
        
        if (!matchResponse.ok) {
            throw new Error('Failed to fetch match history');
        }
        
        const matchData = await matchResponse.json();

        // Format match results
        const formattedResults = {
            topScore: matchData.topScore,
            totalMatches: matchData.totalMatches,
            matchResults: matchData.matchResults?.map(match => ({
                score: match.score,
                matchedFields: match.matches?.matchedFields || [],
                confidence: match.matches?.confidence || {},
                matchDetails: {
                    claimNumber: match.claim?.claimNumber,
                    claimantName: match.claim?.name,
                    physicianName: match.claim?.physicianName,
                    dateOfInjury: match.claim?.dateOfInjury,
                    employerName: match.claim?.employerName
                },
                isRecommended: match.isRecommended
            }))
        };

        console.log('✨ Formatted match results:', formattedResults);
        setDocumentMatchResults(prev => ({
            ...prev,
            [document.OcrId]: formattedResults // Storing match results keyed by OcrId
        }));

    } catch (error) {
        console.error('❌ Error processing document:', error);
    } finally {
        setLoading(false);
    }
};
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
                  <div className="flex items-center space-x-2">
                    <button
                        onClick={() => setSelectionMode(!selectionMode)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                        {selectionMode ? 'Exit Selection' : 'Select Documents'}
                    </button>
                    <button
                        className="flex items-center justify-center text-white bg-green-600 hover:bg-green-300 focus:ring-4 focus:ring-green-200 font-medium rounded-lg text-sm px-4 py-2"
                        onClick={() => setShowBulkUpload(!showBulkUpload)}
                    >
                        + Bulk Upload
                    </button>
                  </div>
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
                      <th scope="col" className="px-4 py-3">
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.length === documents.length}
                            onChange={handleSelectAll}
                            className="w-4 h-4 text-blue-400 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 checked:bg-blue-400 checked:border-blue-400"
                          />
                          <div className="flex items-center gap-2">
                              <span className="pl-3 text-[10px] text-gray-400 dark:text-gray-500">Select All</span>
                          </div>
                        </div>
                      </th>
                      <th scope="col" className="px-4 py-3">Document Name</th>
                      <th scope="col" className="px-4 py-3">Date Uploaded</th>
                      <th scope="col" className="px-4 py-3">Uploader</th>
                      <th scope="col" className="px-4 py-3">View File</th>
                      <th scope="col" className="px-4 py-3">Save File</th>
                      <th scope="col" className="px-4 py-3">Category</th>
                      <th scope="col" className="px-4 py-3">Remove File</th>
                      <th scope="col" className="px-4 py-3">Sort File</th>
                      <th scope="col" className="px-4 py-3">Match History</th>
                    </tr>
                  </thead>
                  <tbody>
                {documents.map((doc) => (
                  <tr 
                    key={doc.OcrId}
                    className={`document-row ${
                      selectedDocumentId === doc.OcrId ? 'document-row-selected' : ''
                    } ${
                      selectedDocuments.includes(doc.OcrId) ? 'bg-blue-50 dark:bg-blue-900' : ''
                    }`}
                    onClick={(e) => {
                      // Prevent row click when clicking checkbox
                      if (e.target.type !== 'checkbox') {
                        handleRowClickII(doc);
                      }
                    }}
                    style={{
                      transition: 'background-color 0.2s ease-in-out',
                      cursor: 'pointer'
                    }}
                  >
                   {selectionMode && (
    <td className="px-4 py-2">
        <input 
            type="checkbox"
            checked={selectedDocuments.includes(doc.OcrId)}
            onChange={() => handleSelectDocument(doc)}
            className="w-4 h-4 border-2 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
    </td>
)}
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
                        handleDeleteClick(doc); 
                      }}>Delete</a>
                    </td>
                    <td className="px-4 py-3">
                      <a href="#" onClick={(e) => { 
                        e.preventDefault();
                        e.stopPropagation(); 
                        handleSortDocuments(doc.OcrId); 
                      }}>Sort</a>
                    </td>
                    <td className="px-4 py-3">
                      <a href="#" 
                         onClick={(e) => viewMatchHistory(doc.OcrId, e)}
                         className="text-blue-600 hover:underline">
                        View History
                      </a>
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

      {showMatchHistory && (
        <div id="popup-modal" tabIndex="-1" className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="relative p-4 w-full max-w-md max-h-full">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <button type="button" className="absolute top-3 end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={() => setShowMatchHistory(false)}>
                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
              <div className="p-4 md:p-5 text-center">
                <svg className="mx-auto mb-4 text-gray-400 w-12 h-12 dark:text-gray-200" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 11V6m0 8h.01M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
                <h3 className="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Match History for Document {selectedDocMatchHistory.OcrId}</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 w-full">
                      <tr>
                        <th scope="col" className="px-4 py-3">Match ID</th>
                        <th scope="col" className="px-4 py-3">Match Date</th>
                        <th scope="col" className="px-4 py-3">Match Score</th>
                        <th scope="col" className="px-4 py-3">Suggested Claims</th>
                        <th scope="col" className="px-4 py-3">Entities</th>
                        <th scope="col" className="px-4 py-3">Match Results</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDocMatchHistory.matchHistory.map((match, index) => (
                        <tr key={index}>
                          <td className="px-4 py-3">{match.matchId}</td>
                          <td className="px-4 py-3">{new Date(match.matchDate).toLocaleDateString()}</td>
                          <td className="px-4 py-3">{match.matchScore}</td>
                          <td className="px-4 py-3">{JSON.stringify(match.suggestedClaims)}</td>
                          <td className="px-4 py-3">{JSON.stringify(match.entities)}</td>
                          <td className="px-4 py-3">{JSON.stringify(match.matchResults)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <SuggestedClaims 
        selectedDocuments={selectedDocuments}
        documentMatchResults={documentMatchResults}
        // bulkSortStatus={bulkSortStatus}
        onBulkSortComplete={onBulkSortComplete}
        aiMatchResults={aiMatchResults}
        sortResults={sortResults}
        onProcess={onProcess}
        
      />

      {selectedDocuments.map(doc => doc && (
        <SingleDocumentProcessor
            key={doc.OcrId}
            document={doc}
            onBulkSortComplete={onBulkSortComplete}
            aiMatchResults={aiMatchResults}
            matchResults={documentMatchResults[doc.OcrId] || {}}
            onProcessComplete={(ocrId, results) => {
                setDocumentMatchResults(prev => ({
                    ...prev,
                    [ocrId]: results
                }));
            }}
        />
      ))}
    </div>
  );
}

DocumentDashboard.propTypes = {
    onSelectDocument: PropTypes.func,
    onSelectDocumentII: PropTypes.func,
    onSelectionChange: PropTypes.func,
    processingEnabled: PropTypes.bool,
    selectedDocuments: PropTypes.array,
    setSelectedDocuments: PropTypes.func,
    onBulkSortComplete: PropTypes.func,
    aiMatchResults: PropTypes.object,
    sortResults: PropTypes.object,
    onProcess: PropTypes.func
};

DocumentDashboard.defaultProps = {
    processingEnabled: false
};

export default DocumentDashboard;