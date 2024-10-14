import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import DocumentDataTable from "../documentdatatable/DocumentDataTable";
import DocumentViewer from "../documentviewer/DocumentViewer";
import { useParams } from "react-router";
import TextModule from "../textmodule/TextModule";

function ClaimProfile() {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [selectedDocumentUrl, setSelectedDocumentUrl] = useState("");
  const [ocrText, setOcrText] = useState("");
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [selectedOcrId, setSelectedOcrId] = useState(null);

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const response = await fetch(
          `http://localhost:4000/new/find/${claimId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        setClaim(data.found);
      } catch (error) {
        console.error(`Error fetching claim details:`, error);
      }
    };

    fetchClaim();
  }, [claimId]);

  const handleCloseDocumentViewer = () => {
    setSelectedDocumentUrl("");
  };

  const handleViewDocument = async (fileUrl, documentId) => {
    setSelectedDocumentUrl(fileUrl);
    setSelectedDocumentId(documentId);

    try {
      const response = await fetch(`http://localhost:4000/new/claims/${claimId}/documents/${documentId}/ocrId`);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setSelectedOcrId(data.OcrId);
    } catch (error) {
      console.error('Error fetching OcrId:', error);
    }
  };

  const handleReadDocument = (text) => {
    setOcrText(text);
  };

  const handleSaveOcrText = async (OcrId, text) => {
    try {
      const response = await fetch(`http://localhost:4000/new/ocr-text/${OcrId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const result = await response.json();
      console.log(result.message);
    } catch (error) {
      console.error('Error saving OCR text:', error);
    }
  };

  if (!claim) {
    return <div>Loading...</div>;
  }

  return (
    <div className="">
      <Sidebar claimId={claim._id} />
      <div className="">
        <div className="mb-4">
          <h1 className="text-2xl font-bold">Claim Profile</h1>
        </div>
        <div className="">
          {/* Any other content or components for the top half */}
        </div>
        <div className="max-h-[500px] w-full overflow-y-auto mb-6 pb-6">
          <DocumentViewer
            documentUrl={selectedDocumentUrl}
            onClose={handleCloseDocumentViewer}
          />
        </div>
        <div className=" ">
          <TextModule 
            text={ocrText} 
            documentUrl={selectedDocumentUrl}
            OcrId={selectedOcrId}
            onSaveOcrText={handleSaveOcrText}
          />
        </div>
        <div className="">
          <DocumentDataTable
            claimId={claim._id}
            onViewDocument={handleViewDocument}
            onReadDocument={handleReadDocument}
          />
        </div>
      </div>
    </div>
    //? Side x Side
    //   <div className="flex h-screen">
    //   <Sidebar claimId={claim._id} />
    //   <div className="flex-1 p-6 flex flex-col justify-between">
    //     <div className="mb-4">
    //       <h1 className="text-2xl font-bold">Claim Profile</h1>
    //     </div>
    //     <div className="flex-1 overflow-auto">
    //       {/* Any other content or components for the top half */}
    //     </div>
    //     <div className="flex flex-row space-x-4 h-1/2">
    //       <div className="flex-1 bg-white p-6 rounded-lg shadow-lg relative dark:bg-gray-800">
    //         <DocumentViewer documentUrl={selectedDocumentUrl} onClose={handleCloseDocumentViewer} />
    //       </div>
    //       <div className="flex-1 bg-white p-6 rounded-lg shadow-lg relative dark:bg-gray-800">
    //         <TextModule />
    //       </div>
    //     </div>
    //     <div className="flex-1">
    //       <DocumentDataTable claimId={claim._id} onViewDocument={setSelectedDocumentUrl} />
    //     </div>
    //   </div>
    // </div>
  );
}

export default ClaimProfile;

//

// import Sidebar from './Sidebar'
// import DocumentDataTable from '../documentdatatable/DocumentDataTable'
// import { useParams } from 'react-router';
// import AllClaims from '../allclaims/AllClaims';
// import FileInputTest from '../fileInput/FileInputTest';

// function ClaimProfile({claimsData, currentClaimNumber}) {

//     // const [claimnumber, setClaimNumber] = useState('');
//     // const [name, setName] = useState ('');
//     // const [date, setDate] = useState ('');
//     // const [claimsData, setClaimsData] = useState ([]);
//     const { claimId } = useParams();
//   const [claim, setClaim] = useState(null);

//   useEffect(() => {
//     const fetchClaim = async () => {
//       try {
//         const response = await fetch(`http://localhost:4000/new/find/${claimId}`);
//         if (!response.ok) {
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         }
//         const data = await response.json();
//         setClaim(data.found);
//       } catch (error) {
//         console.error(`Error fetching claim details:`, error);
//       }
//     };

//     fetchClaim();
//   }, [claimId]);

//   if (!claim) {
//     return <div>Loading...</div>;
//   }
//   return (

//     <div>ClaimProfile

//         {<Sidebar claimsId = {claim._id} />}
//         {< DocumentDataTable claimsData = {claimsData}  className = '' />}

//     </div>
//   );
//   }

// export default ClaimProfile
