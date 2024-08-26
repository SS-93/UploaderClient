// src/components/ParkingSession.jsx
import React, { useState, useEffect } from 'react';
import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard';
import AgnosticInterface from '../agnosticinterface/AgnosticInterface';
import DocumentViewer from '../documentviewer/DocumentViewer';
import { useParams } from 'react-router-dom';
import TextModule from '../textmodule/TextModule';

function ParkingSession() {
    const { parkingSessionId } = useParams();
    const [documents, setDocuments] = useState([]);
    const [selectedDocumentUrl, setSelectedDocumentUrl] = useState('');
    const [isAddingDocuments, setIsAddingDocuments] = useState(false);
    const [uploadedDocuments, setUploadedDocuments] = useState([]);
 

    
    
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

    const handleDocumentView = (url) => {
        setSelectedDocumentUrl(url);
    };

    return (
        <div className="parking-session-container">

            <DocumentViewer/>
            <TextModule/>
            <DocumentDashboard
                documents={documents}
                parkingSessionId={parkingSessionId}
                isAddingDocuments={isAddingDocuments}
                setIsAddingDocuments={setIsAddingDocuments}
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
