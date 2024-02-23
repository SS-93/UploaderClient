import React, {useState, useEffect} from 'react'
import Sidebar from './Sidebar'
import DocumentDataTable from '../documentdatatable/DocumentDataTable'
import { useParams } from 'react-router';

function ClaimProfile({claimsData}) {

    // const [claimnumber, setClaimNumber] = useState('');
    // const [name, setName] = useState ('');
    // const [date, setDate] = useState ('');
    // const [claimsData, setClaimsData] = useState ([]);
    const { claimId } = useParams();
  const [claim, setClaim] = useState(null);

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

  if (!claim) {
    return <div>Loading...</div>;
  }
  return (
    <div>ClaimProfile
        {<Sidebar claimsData = {claimsData} />}
        {< DocumentDataTable claimsData = {claimsData}  className = '' />}

    </div>
  );
  }


export default ClaimProfile