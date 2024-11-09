import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import ClaimQueryMatrix from '../claimquerymatrix/ClaimQueryMatrix';
import Sidebar from './Sidebar';

const ClaimDock = () => {
  // States from AllClaims
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [claimsData, setClaimsData] = useState({ getAllClaims: [] });
  const [currentClaimNumber, setCurrentClaimNumber] = useState('');
  const [currentClaimId, setCurrentClaimId] = useState('');
  const [loading, setLoading] = useState(true);
  const { claimId } = useParams();

  // Fetch claims on mount (from AllClaims)
  useEffect(() => {
    getAllClaims();
  }, []);

  async function getAllClaims() {
    try {
      const getClaimsRoute = 'http://localhost:4000/new/list';
      let response = await fetch(getClaimsRoute, {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        const transformedData = {
          getAllClaims: data.claims.map(claim => ({
            ...claim,
            name: claim.name || 'John Doe',
            date: claim.date || new Date().toLocaleDateString(),
            adjuster: claim.adjuster || 'Jane Smith'
          }))
        };
        setClaimsData(transformedData);
        setLoading(false);
      } else {
        console.error('Failed to fetch claims data');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
      setLoading(false);
    }
  }

  // Handle claim selection (from AllClaims)
  const handleClaimClick = (claim) => {
    setSelectedClaim(claim);
    setCurrentClaimNumber(claim.claimnumber);
    setCurrentClaimId(claim._id);
  };

  return (
    <>
      <nav className="bg-white border-gray-200 dark:bg-gray-900">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl p-4">
          <Link to="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <img src="https://flowbite.com/docs/images/logo.svg" className="h-8" alt="Flowbite Logo" />
            <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">
              Upload.Me
            </span>
          </Link>
          <div className="flex items-center space-x-6 rtl:space-x-reverse">
            <a href="tel:5541251234" className="text-sm text-gray-500 dark:text-white hover:underline">
              (555) 412-1234
            </a>
            <Link to="/login" className="text-sm text-blue-600 dark:text-blue-500 hover:underline">
              Login
            </Link>
          </div>
        </div>
      </nav>
      
      <nav className="bg-gray-50 dark:bg-gray-700">
        <div className="max-w-screen-xl px-4 py-3 mx-auto">
          <div className="flex items-center">
            <ul className="flex flex-row font-medium mt-0 space-x-8 rtl:space-x-reverse text-sm">
              <li>
                <Link to="/" className="text-gray-900 dark:text-white hover:underline" aria-current="page">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/company" className="text-gray-900 dark:text-white hover:underline">
                  Company
                </Link>
              </li>
              <li>
                <Link to="/team" className="text-gray-900 dark:text-white hover:underline">
                  Team
                </Link>
              </li>
              <li>
                <Link to="/features" className="text-gray-900 dark:text-white hover:underline">
                  Features
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Show Sidebar when claim is selected (like in AllClaims) */}
        {selectedClaim && <Sidebar claimId={currentClaimId} />}
        
        {/* Claims table with same structure as AllClaims */}
        <ClaimQueryMatrix 
          claimsData={claimsData}
          isLoading={loading}
          onClaimClick={handleClaimClick}
          selectedClaim={selectedClaim}
        />
      </div>
    </>
  );
};

export default ClaimDock;
