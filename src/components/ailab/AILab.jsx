import React, { useState, useEffect } from 'react'
import AiProcessor from '../aiprocessor/AiProcessor'
import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard'
import ParkingSession from '../parkingsession/ParkingSession';
import SuggestedClaims from '../allclaims/SuggestedClaims';

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
      <DocumentDashboard
        onSelectDocument={handleSelectDocument}
        onSelectDocumentII={handleSelectDocumentII}
        // ... other props
      />
      <SuggestedClaims 
        selectedDocument={selectedDocument}
        indexedClaims={indexedClaims}
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