import React, { useState, useEffect } from 'react'
import AiProcessor from '../aiprocessor/AiProcessor'
import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard'
import SuggestedClaims from '../suggestedclaims/SuggestedClaims';

function AILab() {
  const [selectedOcrId, setSelectedOcrId] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [matchResults, setMatchResults] = useState([]);

  const handleSelectDocument = async (documentData) => {
    setSelectedOcrId(documentData.OcrId);
    setSelectedDocument(documentData);
    
    if (documentData.OcrId) {
      try {
        // If document already has text content, use it
        if (documentData.textContent) {
          setOcrText({
            textContent: documentData.textContent,
            fileName: documentData.fileName,
            category: documentData.category
          });

          // Fetch suggested claims
          await fetchSuggestedClaims(documentData.OcrId);
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

        // Fetch suggested claims after getting OCR text
        await fetchSuggestedClaims(documentData.OcrId);
      } catch (error) {
        console.error('Error fetching OCR text:', error);
        setOcrText({ textContent: 'Failed to load OCR text' });
      }
    } else {
      setOcrText(null);
      setSelectedDocument(null);
      setMatchResults([]);
    }
  };

  const fetchSuggestedClaims = async (OcrId) => {
    try {
      const response = await fetch(`http://localhost:4000/ai/suggested-claims/${OcrId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch suggested claims');
      }
      const data = await response.json();
      setMatchResults(data.matchResults || []);
      
      // Update selected document with match results
      setSelectedDocument(prevDoc => ({
        ...prevDoc,
        matchResults: data.matchResults || []
      }));
    } catch (error) {
      console.error('Error fetching suggested claims:', error);
      setMatchResults([]);
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
        
        // Fetch suggested claims
        await fetchSuggestedClaims(document.OcrId);
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
      const normalizedDocument = {
        OcrId: document.OcrId,
        fileName: document.fileName || 'Untitled Document',
        category: document.category || 'Uncategorized',
        uploadDate: document.uploadDate || new Date().toISOString(),
        textContent: document.textContent || ''
      };

      setSelectedDocument(normalizedDocument);
      
      // Fetch suggested claims for the normalized document
      if (normalizedDocument.OcrId) {
        await fetchSuggestedClaims(normalizedDocument.OcrId);
      }

    } catch (error) {
      console.error('Error processing document for suggestions:', error);
    }
  };

  return (
    <div>
      <h1>AI Lab</h1>
      <AiProcessor 
        selectedOcrId={selectedOcrId}
        ocrText={ocrText}
      />

      <SuggestedClaims 
        selectedDocument={selectedDocument}
        matchResults={matchResults}
        fileName={selectedDocument?.fileName}
      />
        
      <DocumentDashboard
        onSelectDocument={handleSelectDocument}
        onSelectDocumentII={(doc) => {
          handleSelectDocumentII(doc);
          handleDocumentForSuggestions(doc);
        }}
      />
    </div>
  )
}

export default AILab