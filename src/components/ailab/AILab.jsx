import React, { useState, useEffect } from 'react'
import AiProcessor from '../aiprocessor/AiProcessor'
import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard'
import ParkingSession from '../parkingsession/ParkingSession';
import SuggestedClaims from '../suggestedclaims/SuggestedClaims';

function AILab() {
  const [selectedOcrId, setSelectedOcrId] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [indexedClaims, setIndexedClaims] = useState([]);

  const handleSelectDocument = async (documentData) => {
    setSelectedOcrId(documentData.OcrId);
    if (documentData.OcrId) {
      try {
        // If document already has text content, use it
        if (documentData.textContent) {
          setSelectedDocument({
            OcrId: documentData.OcrId,
            textContent: documentData.textContent,
            fileName: documentData.fileName,
            category: documentData.category
          });
          setOcrText({
            textContent: documentData.textContent,
            fileName: documentData.fileName,
            category: documentData.category
          });
          return;
        }

        // Use the dms endpoint for parked uploads
        const response = await fetch(`http://localhost:4000/dms/ocr-text/${documentData.OcrId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch OCR text');
        }
        const data = await response.json();
        setOcrText({
          textContent: data.textContent,
          fileName: data.fileName,
          category: data.category
        });
      } catch (error) {
        console.error('Error fetching OCR text:', error);
        setOcrText({ textContent: 'Failed to load OCR text' });
      }
    } else {
      setOcrText(null);
      setSelectedDocument(null);
    }
  };

  const handleSelectDocumentII = async (document) => {
    setSelectedDocument(document);
    setSelectedOcrId(document.OcrId);
    if (document.OcrId) {
      try {
        const response = await fetch(`http://localhost:4000/dms/ocr-text/${document.OcrId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch OCR text');
        }
        const data = await response.json();
        setOcrText(data.textContent);
      } catch (error) {
        console.error('Error fetching OCR text:', error);
        setOcrText('Failed to load OCR text');
      }
    } else {
      setOcrText('');
    }
  };

  const handleDocumentForSuggestions = async (document) => {
    try {
      // Normalize document data for suggestions
      const normalizedDocument = {
        OcrId: document.OcrId,
        fileName: document.fileName || 'Untitled Document',
        category: document.category || 'Uncategorized',
        uploadDate: document.uploadDate || new Date().toISOString(),
        textContent: document.textContent || ''
      };

      // Update selectedDocument state for SuggestedClaims
      setSelectedDocument(normalizedDocument);

      console.log('Document processed for suggestions:', normalizedDocument);

    } catch (error) {
      console.error('Error processing document for suggestions:', error);
    }
  };

  const fetchOcrText = async (OcrId) => {
    try {
      // Ensure OcrId is passed as a number
      const response = await fetch(`http://localhost:4000/new/ocr-text/${parseInt(OcrId, 10)}`);
      if (!response.ok) throw new Error('Failed to fetch OCR text');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching OCR text:', error);
      throw error;
    }
  };

  const saveOcrText = async (OcrId, text) => {
    try {
      const response = await fetch(`http://localhost:4000/dms/ocr-text/${parseInt(OcrId, 10)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) throw new Error('Failed to save OCR text');
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error saving OCR text:', error);
      throw error;
    }
  };

  return (
    <div>
      <h1>AI Lab</h1>
      <AiProcessor 
        selectedOcrId={selectedOcrId}
        ocrText={ocrText}
        // ... other props
      />

<SuggestedClaims 
        selectedDocument={selectedDocument}
        indexedClaims={indexedClaims}
        fileName={selectedDocument?.fileName}
      />
        
      <DocumentDashboard
        onSelectDocument={handleSelectDocument}
        onSelectDocumentII={(doc) => {
          handleSelectDocumentII(doc);
          handleDocumentForSuggestions(doc);
        }}
        // ... other props
      />

      
   
       {/* <ParkingSession
        onSelectDocument={handleSelectDocument}
        selectedOcrId={selectedOcrId}
        // ... other props
      />
       */}
    </div>
  )
}

export default AILab