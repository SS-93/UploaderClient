// src/components/ParkingSession.jsx
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
    const [isAddingDocuments, setIsAddingDocuments] = useState(false);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
    const [ocrText, setOcrText] = useState("");

    
    
    useEffect(() => {
        fetchNewlyUploadedDocuments(); // Fetch documents when component mounts
      }, []);
    
      const fetchNewlyUploadedDocuments = async () => {
        try {
          const response = await fetch('http://localhost:4000/dms/recent-uploads');
          if (response.ok) {
            const result = await response.json();
            setUploadedDocuments(result.files); // Set state with the newly fetched documents
          } else {
            console.error('Failed to fetch newly uploaded documents');
          }
        } catch (error) {
          console.error('Error fetching newly uploaded documents:', error);
        }
      };

      useEffect(() => {
        fetchDocuments(); // Fetch documents when component mounts
      }, [parkingSessionId]);
    
      const fetchDocuments = async () => {
        try {
          const response = await fetch(`http://localhost:4000/dms/parked-uploads/:parkId`);
          if (response.ok) {
            const result = await response.json();
            setDocuments(result.files); // Update state with fetched documents
          } else {
            console.error('Failed to fetch documents');
          }
        } catch (error) {
          console.error('Error fetching documents:', error);
        }
      };
    
      const handleDocumentView = (url) => {
        setSelectedDocumentUrl(url);
      };
    
      const handleCloseDocumentViewer = () => {
        setSelectedDocumentUrl('');
      };
    
      const handleReadDocument = (text) => {
        setOcrText(text);
      };
    

    return (
        <div className="parking-session-container">

            <DocumentViewer
               documentUrl={selectedDocumentUrl}
               onClose={handleCloseDocumentViewer}/>
            <TextModule text={ocrText} 
          documentUrl = {selectedDocumentUrl}/>
            <DocumentDashboard
                documents={documents}
                parkingSessionId={parkingSessionId}
                isAddingDocuments={isAddingDocuments}
                setIsAddingDocuments={setIsAddingDocuments}
                onViewDocument={handleDocumentView} // Pass the handler to DocumentDashboard
            />
            <AgnosticInterface
                documents={documents}
                parkingSessionId={parkingSessionId}
                onDocumentView={handleDocumentView}
            />
            {/* {selectedDocumentUrl && (
                <DocumentViewer documentUrl={selectedDocumentUrl} onClose={() => setSelectedDocumentUrl('')} />
            )} */}
        </div>
    );
}

export default ParkingSession;
