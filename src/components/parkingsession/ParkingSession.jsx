// import React, { useState, useEffect } from 'react';
// import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard';
// import AgnosticInterface from '../agnosticinterface/AgnosticInterface';
// import DocumentViewer from '../documentviewer/DocumentViewer';
// import { useParams } from 'react-router-dom';
// import TextModule from '../textmodule/TextModule';

// function ParkingSession() {
//   const { parkingSessionId, parkId } = useParams();
//   const [documents, setDocuments] = useState([]);
//   const [selectedDocumentUrl, setSelectedDocumentUrl] = useState('');
//   const [selectedDocumentId, setSelectedDocumentId] = useState(''); 
//   const [isAddingDocuments, setIsAddingDocuments] = useState(false);
//   const [uploadedDocuments, setUploadedDocuments] = useState([]);
//   const [ocrText, setOcrText] = useState("");
//   const [textContent, setTextContent] = useState(''); // State to store the current text content

//   useEffect(() => {
//     fetchNewlyUploadedDocuments(); // Fetch documents when component mounts
//   }, []);

//   const fetchNewlyUploadedDocuments = async () => {
//     try {
//       const response = await fetch('http://localhost:4000/dms/recent-uploads');
//       if (response.ok) {
//         const result = await response.json();
//         setUploadedDocuments(result.files); // Set state with the newly fetched documents
//       } else {
//         console.error('Failed to fetch newly uploaded documents');
//       }
//     } catch (error) {
//       console.error('Error fetching newly uploaded documents:', error);
//     }
//   };

//   useEffect(() => {
//     fetchDocuments(); // Fetch documents when component mounts
//   }, [parkingSessionId]);

//   const fetchDocuments = async () => {
//     try {
//       const response = await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`);
//       if (response.ok) {
//         const result = await response.json();
//         setDocuments(result.files); // Update state with fetched documents
//       } else {
//         console.error('Failed to fetch documents');
//       }
//     } catch (error) {
//       console.error('Error fetching documents:', error);
//     }
//   };

//   const handleDocumentView = async (url, id) => {
//     setSelectedDocumentUrl(url);
//     setSelectedDocumentId(id);

//     // Fetch the document details, including text content
//     try {
//       const response = await fetch(`http://localhost:4000/dms/get-document/${id}`); // New endpoint to get document details
//       if (response.ok) {
//         const documentData = await response.json();
//         setTextContent(documentData.textContent || ''); // Update the text content state
//       } else {
//         console.error('Failed to fetch document details');
//         setTextContent(''); // Clear text content if fetching fails
//       }
//     } catch (error) {
//       console.error('Error fetching document details:', error);
//       setTextContent(''); // Clear text content if error occurs
//     }
//   };

//   const handleCloseDocumentViewer = () => {
//     setSelectedDocumentUrl('');
//     setSelectedDocumentId('');
//     setTextContent(''); // Clear text content when viewer is closed
//   };

//   const handleReadDocument = (text) => {
//     setOcrText(text);
//   };

//   return (
//     <div className="parking-session-container">
//       <DocumentViewer
//         documentUrl={selectedDocumentUrl}
//         onClose={handleCloseDocumentViewer}
//       />
//       <TextModule
//         documentUrl={selectedDocumentUrl}
//         documentId={selectedDocumentId} 
//         textContent={textContent} // Pass the current text content to TextModule
//         onTextExtracted={handleReadDocument}
//       />
//       <DocumentDashboard
//         documents={documents}
//         parkingSessionId={parkingSessionId}
//         isAddingDocuments={isAddingDocuments}
//         setIsAddingDocuments={setIsAddingDocuments}
//         onViewDocument={handleDocumentView} // Pass the handler to DocumentDashboard
//       />
//       <AgnosticInterface
//         documents={documents}
//         parkingSessionId={parkingSessionId}
//         onDocumentView={handleDocumentView}
//       />
//     </div>
//   );
// }

// export default ParkingSession;
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
  const [selectedDocumentId, setSelectedDocumentId] = useState(''); // This will hold the `documentId` (not _id)
  const [isAddingDocuments, setIsAddingDocuments] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [ocrText, setOcrText] = useState("");
  const [textContent, setTextContent] = useState('');

  useEffect(() => {
    fetchNewlyUploadedDocuments();
  }, []);

  const fetchNewlyUploadedDocuments = async () => {
    try {
      const response = await fetch('http://localhost:4000/dms/recent-uploads');
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

  useEffect(() => {
    fetchDocuments();
  }, [parkingSessionId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`http://localhost:4000/dms/parked-uploads/${parkId}`);
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

  const handleDocumentView = async (url, documentId) => {
    setSelectedDocumentUrl(url);
    setSelectedDocumentId(documentId); // Set the `documentId` for viewing and editing

    if (documentId) {
      try {
        const response = await fetch(`http://localhost:4000/dms/document/${documentId}`);
        if (response.ok) {
          const documentData = await response.json();
          setTextContent(documentData.textContent || '');
        } else {
          console.error('Failed to fetch document details');
          setTextContent('');
        }
      } catch (error) {
        console.error('Error fetching document details:', error);
        setTextContent('');
      }
    } else {
      console.error('Invalid document ID');
      setTextContent('');
    }
  };

  const handleCloseDocumentViewer = () => {
    setSelectedDocumentUrl('');
    setSelectedDocumentId(''); // Reset the `documentId`
    setTextContent('');
  };

  const handleReadDocument = (text) => {
    setOcrText(text);
  };

  return (
    <div className="parking-session-container">
      <DocumentViewer
        documentUrl={selectedDocumentUrl}
        onClose={handleCloseDocumentViewer}
      />
      <TextModule
        documentUrl={selectedDocumentUrl}
        documentId={selectedDocumentId} // Correctly passing the `documentId`
        textContent={textContent}
        onTextExtracted={handleReadDocument}
      />
      <DocumentDashboard
        documents={documents}
        parkingSessionId={parkingSessionId}
        isAddingDocuments={isAddingDocuments}
        setIsAddingDocuments={setIsAddingDocuments}
        onViewDocument={handleDocumentView} // Use correct handler with `documentId`
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

