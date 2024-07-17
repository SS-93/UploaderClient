import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import DocumentDataTable from '../documentdatatable/DocumentDataTable';
import DocumentViewer from '../documentviewer/DocumentViewer';
import { useParams } from 'react-router';

function ClaimProfile() {
  const { claimId } = useParams();
  const [claim, setClaim] = useState(null);
  const [ selectedDocumentUrl, setSelectedDocumentUrl] = useState('')

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const response = await fetch(`http://localhost:4000/new/find/${claimId}`);
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
    setSelectedDocumentUrl('');
  };

  if (!claim) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex h-screen">
    <Sidebar claimId={claim._id} />
    <div className="flex-1 p-6 flex flex-col justify-between">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Claim Profile</h1>
      </div>
      <div className="flex-1 overflow-auto">
        {/* Any other content or components for the top half */}
      </div>
      <div className="h-1/2">
          <DocumentViewer documentUrl={selectedDocumentUrl} onClose= {handleCloseDocumentViewer} />
        </div>
      <div className="h-1/2">
      <DocumentDataTable claimId={claim._id} onViewDocument={setSelectedDocumentUrl} />
      </div>
      
    </div>
  </div>
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