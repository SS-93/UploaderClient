import {React, useState, useEffect} from 'react'
import { Link } from 'react-router-dom';
import Sidebar from '../claimprofile/Sidebar';
import { useClaimContext } from '../claimcontext/ClaimContext';



function AllClaims() {

  const [selectedClaim, setSelectedClaim] = useState (null);
    const [claimnumber, setClaimNumber] = useState('');
    const [name, setName] = useState ('');
    const [date, setDate] = useState ('');
    const [claimsData, setClaimsData] = useState([]);
    const [currentClaimNumber, setCurrentClaimNumber] = useState('');

    useEffect(() => {
        getAllClaims();
    }, []);
    

    async function getAllClaims() {

    
        try {
            
            const getClaimsRoute = 'http://localhost:4000/new/list'

            let response = await fetch (getClaimsRoute, {
                method: 'GET',
                headers: {
                    'content-type': 'application/json',

                },
                });
                if (response.ok) {
                    const data = await response.json ();
                    setClaimsData(data);

                } else {
                    console.error ('Failed to fetch claims data')
                }
            
        } catch (error) {
            console.error('Error fetching claims :', error);
            
        }
    }
    const handleClaimClick = (claim) => {
      setSelectedClaim(claim);
      setCurrentClaimNumber(claim.claimnumber);
    };

  return (
    
<div>
All Claims

 

       
<div className="relative overflow-x-auto">
    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-200 uppercase bg-slate-900 dark:bg-gray-700 dark:text-gray-400">
            <tr>
                <th scope="col" className="px-6 py-3">
                    Claim Number
                </th>
                <th scope="col" className="px-6 py-3">
                    Name
                </th>
                <th scope="col" className="px-6 py-3">
                    Date
                </th>
                <th scope="col" className="px-6 py-3">
                    Adjuster
                </th>
            </tr>
        </thead>
        <tbody>
            {claimsData.getAllClaims?.map((claim) => (
              <tr key={claim._id} className="bg-stone-600 border-b dark:bg-gray-800 dark:border-gray-700"
              onClick={()=> handleClaimClick(claim)}
              style ={{cursor: 'pointer'}} >

                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white hover:bg-gradient-to-r from-slate-600 via-blue-00 to-slate-600 active:bg-violet-700 focus:outline-slate-300 focus:ring focus:ring-blue-300 bg-opacity-25 ">
                 <Link to = {`/claims/${claim._id}`}> {claim.claimnumber}</Link>
                </th>
                <td className="px-6 py-4">
                  {claim.name}
                </td>
                <td className="px-6 py-4">
                  {claim.date}
                </td>
                <td className="px-6 py-4">
                   {claim.adjuster} 
                </td>
              </tr>
            ))}
          </tbody>
    </table>
</div>  
{/* 
{claimsData.getAllClaims?.map((claim) => (
            <div key={claim._id}>
              <h1>{claim.claimnumber}</h1>
              <h2>{claim.name}</h2>
              <h3>{claim.date}</h3>
            </div>
          ))} */}

{selectedClaim && <Sidebar claimNumber={currentClaimNumber} />}
</div> 

  )}

export default AllClaims