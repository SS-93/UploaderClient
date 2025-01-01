import React, { useState, useEffect } from 'react';
import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard';
import AgnosticInterface from '../agnosticinterface/AgnosticInterface';
import DocumentViewer from '../documentviewer/DocumentViewer';
import { useParams } from 'react-router-dom';
import TextModule from '../textmodule/TextModule';

function ParkingSession() {
  const { parkingSessionId, parkId } = useParams();
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState('');
  const [selectedOcrId, setSelectedOcrId] = useState('');
  const [isAddingDocuments, setIsAddingDocuments] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [ocrText, setOcrText] = useState("");
  const [textContent, setTextContent] = useState('');
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  useEffect(() => {
    fetchNewlyUploadedDocuments();
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [parkingSessionId]);

  const fetchNewlyUploadedDocuments = async () => {
    try {
      const response = await fetch('http://localhost:4000/new/recent-uploads');
      if (response.ok) {
        const result = await response.json();
        setUploadedDocuments(result.files);
      } else {
        console.error('Failed to fetch newly uploaded documents');
      }
    } catch (error) {
      console.error('Error fetching newly uploaded documents:', error);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`http://localhost:4000/new/parked-uploads/${parkId}`);
      if (response.ok) {
        const result = await response.json();
        setDocuments(result.files);
      } else {
        console.error('Failed to fetch documents');
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleDocumentView = async (url, OcrId) => {
    setSelectedDocumentUrl(url);
    setSelectedOcrId(OcrId);

    if (OcrId) {
      try {
        const response = await fetch(`http://localhost:4000/new/ocr-text/${OcrId}`);
        const data = await response.json();
        
        if (response.ok) {
          setTextContent(data.textContent || '');
        } else {
          console.error('Failed to fetch OCR text content:', data.error);
          setTextContent('');
        }
      } catch (error) {
        console.error('Error fetching OCR text content:', error);
        setTextContent('');
      }
    } else {
      console.error('Invalid OcrId');
      setTextContent('');
    }
  };

  const handleCloseDocumentViewer = () => {
    setSelectedDocumentUrl('');
    setSelectedOcrId('');
    setTextContent('');
  };

  const handleReadDocument = (text) => {
    setOcrText(text);
  };

  const saveOcrText = async (OcrId, ocrText) => {
    try {
      const response = await fetch(`http://localhost:4000/dms/ocr-text/${OcrId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: ocrText }),
      });

      if (!response.ok) {
        throw new Error('Failed to save OCR text');
      }

      const data = await response.json();
      setTextContent(ocrText);
      
      setDocuments(prevDocs => 
        prevDocs.map(doc => 
          doc.OcrId === OcrId 
            ? { ...doc, textContent: ocrText }
            : doc
        )
      );

      return Promise.resolve();
    } catch (error) {
      console.error('Error saving OCR text:', error);
      return Promise.reject(error);
    }
  };

  return (
    <div className="parking-session-container">
      <DocumentViewer
        documentUrl={selectedDocumentUrl}
        onClose={handleCloseDocumentViewer}
      />
      <TextModule
        documentUrl={selectedDocumentUrl}
        OcrId={selectedOcrId}
        textContent={textContent}
        onTextExtracted={handleReadDocument}
        onSaveOcrText={saveOcrText}
      />
      <DocumentDashboard
        documents={documents}
        parkingSessionId={parkingSessionId}
        isAddingDocuments={isAddingDocuments}
        setIsAddingDocuments={setIsAddingDocuments}
        onViewDocument={handleDocumentView}
        selectedDocuments={selectedDocuments}
        setSelectedDocuments={setSelectedDocuments}
      />
      <AgnosticInterface
        documents={documents}
        parkingSessionId={parkingSessionId}
        onDocumentView={handleDocumentView}
      />
    </div>
  );
}

export default ParkingSession;