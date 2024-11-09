import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const ClaimQueryMatrix = () => {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredClaims, setFilteredClaims] = useState([]);

  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    getMatrixClaims();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredClaims(claims);
      return;
    }

    const searchResults = claims.filter(claim => 
      claim.claimnumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      claim.adjuster?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredClaims(searchResults);
  }, [searchTerm, claims]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  async function getMatrixClaims() {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:4000/new/list', {
        method: 'GET',
        headers: {
          'content-type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setClaims(data.getAllClaims || []);
      }
    } catch (error) {
      console.error('Error fetching claims:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-gray-50 dark:bg-gray-900 p-3 sm:p-5">
      <div className="mx-auto max-w-screen-xl px-4 lg:px-12">
        <div className="bg-white dark:bg-gray-800 relative shadow-md sm:rounded-lg overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-3 md:space-y-0 md:space-x-4 p-4">
            <div className="w-full md:w-1/2">
              <form className="flex items-center">
                <label htmlFor="simple-search" className="sr-only">Search</label>
                <div className="relative w-full">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 p-2"
                    placeholder="Search claims"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </form>
            </div>
            <div className="w-full md:w-auto flex flex-col md:flex-row space-y-2 md:space-y-0 items-stretch md:items-center justify-end md:space-x-3 flex-shrink-0">
              <button className="flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-4 py-2">
                <svg className="h-3.5 w-3.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" />
                </svg>
                Add Claim
              </button>
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="w-full md:w-auto flex items-center justify-center py-2 px-4 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" />
                </svg>
                Filter
              </button>
            </div>
          </div>

          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
              <thead className="text-xs text-gray-200 uppercase bg-slate-900 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Claim Number</th>
                  <th scope="col" className="px-6 py-3">Name</th>
                  <th scope="col" className="px-6 py-3">Date</th>
                  <th scope="col" className="px-6 py-3">Adjuster</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">Loading...</td>
                  </tr>
                ) : filteredClaims.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center py-4">
                      {searchTerm ? 'No matching claims found' : 'No claims available'}
                    </td>
                  </tr>
                ) : (
                  filteredClaims.map((claim) => (
                    <tr 
                      key={claim._id} 
                      className="bg-stone-600 border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-700"
                    >
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white hover:bg-gradient-to-r from-slate-600 via-blue-00 to-slate-600">
                        <Link to={`/claims/${claim._id}`}>{claim.claimnumber}</Link>
                      </th>
                      <td className="px-6 py-4">{claim.name}</td>
                      <td className="px-6 py-4">
                        {new Date(claim.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">{claim.adjuster}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ClaimQueryMatrix;