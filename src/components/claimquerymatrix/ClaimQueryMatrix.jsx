import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const getCategoryColor = (category) => {
  const categories = {
    'Medical': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    'Legal': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    'Insurance': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    'Financial': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    'Personal': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300',
    'Uncategorized': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  };
  return categories[category] || categories['Uncategorized'];
};

const ClaimQueryMatrix = () => {
  const [claims, setClaims] = useState([]);
  const [filteredClaims, setFilteredClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [expandedClaimId, setExpandedClaimId] = useState(null);
  const [claimDocuments, setClaimDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentSearchTerm, setDocumentSearchTerm] = useState('');
  const [documentSearchResults, setDocumentSearchResults] = useState([]);
  const [documentSearchLoading, setDocumentSearchLoading] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState(null);

  // Add search operators helper
  const searchOperators = {
    claim: 'claim:',
    adj: 'adj:',
    doc: 'doc:',
    name: 'name:',
    date: 'date:'
  };

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

  // Enhanced search function
  const handleSearch = async (query) => {
    try {
      // Check if query contains any operators
      const hasOperators = Object.values(searchOperators).some(op => query.includes(op));
      setIsAdvancedSearch(hasOperators);

      if (hasOperators || query.length >= 3) { // Only trigger advanced search if operators or 3+ chars
        setLoading(true);
        const response = await fetch(`http://localhost:4000/new/search?query=${encodeURIComponent(query)}`);
        const data = await response.json();
        
        // Transform results to include matching documents
        const processedResults = data.results.map(claim => ({
          ...claim,
          hasMatches: claim.matchingDocuments?.length > 0,
          matchCount: claim.matchingDocuments?.length || 0
        }));
        
        setFilteredClaims(processedResults);
      } else {
        // Use simple filter for basic searches
        const filtered = claims.filter(claim =>
          claim.claimnumber?.toLowerCase().includes(query.toLowerCase()) ||
          claim.name?.toLowerCase().includes(query.toLowerCase()) ||
          claim.adjuster?.toLowerCase().includes(query.toLowerCase())
        );
        setFilteredClaims(filtered);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Highlight matching text
  const highlightText = (text, searchTerm) => {
    if (!searchTerm?.trim() || !text) return text;

    // Handle operator-based searches
    let termToHighlight = searchTerm;
    Object.entries(searchOperators).forEach(([_, operator]) => {
      if (searchTerm.startsWith(operator)) {
        termToHighlight = searchTerm.slice(operator.length);
      }
    });

    // Escape special characters in the search term
    const escapedTerm = termToHighlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark 
          key={i} 
          className="bg-yellow-200 dark:bg-yellow-900/50 px-0.5 rounded"
        >
          {part}
        </mark>
      ) : part
    );
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

  const fetchClaimDocuments = async (claimId) => {
    if (!claimId) return;
    
    try {
      setLoadingDocuments(true);
      const response = await fetch(`http://localhost:4000/new/claims/${claimId}/documents`);
      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      setClaimDocuments(data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleRowClick = async (claimId) => {
    if (expandedClaimId === claimId) {
      setExpandedClaimId(null);
      setClaimDocuments([]);
      setDocumentSearchTerm('');
      setDocumentSearchResults([]);
    } else {
      setExpandedClaimId(claimId);
      await fetchClaimDocuments(claimId);
    }
  };

  const handleDownload = async (fileUrl, fileName) => {
    try {
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const handleDocumentSearch = async (claimId, searchTerm) => {
    if (!searchTerm.trim()) {
      setDocumentSearchResults([]);
      return;
    }

    setDocumentSearchLoading(true);
    try {
      const response = await fetch(
        `http://localhost:4000/new/claims/${claimId}/documents/search?query=${encodeURIComponent(searchTerm)}`
      );
      
      if (!response.ok) throw new Error('Document search failed');
      
      const data = await response.json();
      setDocumentSearchResults(data.results);
    } catch (error) {
      console.error('Document search error:', error);
    } finally {
      setDocumentSearchLoading(false);
    }
  };

  const toggleFilter = () => setFilterOpen(!filterOpen);

  const handleDocumentClick = (docId) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  // Add a new animation to your CSS
  const styles = {
    '@keyframes fadeIn': {
      from: { opacity: 0, transform: 'translateY(-10px)' },
      to: { opacity: 1, transform: 'translateY(0)' }
    },
    '.animate-fadeIn': {
      animation: 'fadeIn 0.2s ease-out'
    }
  };

  return (
    <section className="container mx-auto p-6">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="p-4 border-b dark:border-gray-700">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1 relative">
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                placeholder="Search claims..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  handleSearch(e.target.value);
                }}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            <button
              onClick={toggleFilter}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
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
                {/* <th scope="col" className="px-6 py-3">
                  <div className="flex items-center space-x-1">
                    <span>Document Search</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </th> */}
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
                  <React.Fragment key={claim._id}>
                    <tr 
                      onClick={() => handleRowClick(claim._id)}
                      className={`cursor-pointer ${
                        claim.hasMatches ? 'bg-yellow-50 dark:bg-yellow-900/20' : ''
                      } ${expandedClaimId === claim._id ? 'bg-gray-100 dark:bg-gray-700' : 'bg-stone-600'}
                      border-b dark:border-gray-700 hover:bg-gray-700`}
                    >
                      <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                        <Link to={`/claims/${claim._id}`}>
                          {highlightText(claim.claimnumber, searchTerm)}
                        </Link>
                      </th>
                      <td className="px-6 py-4">{highlightText(claim.name, searchTerm)}</td>
                      <td className="px-6 py-4">
                        {new Date(claim.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">{highlightText(claim.adjuster, searchTerm)}</td>
                      {isAdvancedSearch && (
                        <td className="px-6 py-4 text-sm">
                          {claim.matchCount > 0 && (
                            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                              {claim.matchCount} matches
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                    
                    {expandedClaimId === claim._id && (
                      <tr>
                        <td colSpan="5" className="px-6 py-4">
                          <div className="animate-fadeIn space-y-4">
                            {/* Document Search UI */}
                            <div className="bg-slate-600 p-4 rounded-lg shadow">
                              <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                  <div className="relative flex-1">
                                    <input
                                      type="text"
                                      className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
                                      placeholder="Search documents in this claim..."
                                      value={documentSearchTerm}
                                      onChange={(e) => setDocumentSearchTerm(e.target.value)}
                                      onKeyDown={(e) => e.key === 'Enter' && handleDocumentSearch(claim._id, documentSearchTerm)}
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                      </svg>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => handleDocumentSearch(claim._id, documentSearchTerm)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                                  >
                                    Search Documents
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Documents List */}
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                              <div className="p-4 border-b dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                  <h3 className="text-lg font-semibold">Documents</h3>
                                  <span className="text-sm text-gray-500">
                                    {documentSearchTerm 
                                      ? `${documentSearchResults.length} matches found`
                                      : `${claimDocuments.length} total documents`}
                                  </span>
                                </div>
                              </div>

                              <div className="divide-y dark:divide-gray-700">
                                {documentSearchLoading ? (
                                  <div className="p-4 text-center">Searching documents...</div>
                                ) : (
                                  (documentSearchTerm ? documentSearchResults : claimDocuments).map((doc) => (
                                    <React.Fragment key={doc._id}>
                                      <div 
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                                        onClick={() => handleDocumentClick(doc._id)}
                                      >
                                        <div className="flex justify-between items-start">
                                          <div className="space-y-1">
                                            <div className="flex items-center space-x-2">
                                              <span className="font-medium">
                                                {highlightText(doc.fileName, documentSearchTerm)}
                                              </span>
                                              <span className={`px-2 py-0.5 rounded-full text-xs ${getCategoryColor(doc.category)}`}>
                                                {doc.category || 'Uncategorized'}
                                              </span>
                                            </div>
                                            {documentSearchTerm && doc.matchDetails?.textMatches?.[0] && (
                                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                                {highlightText(doc.matchDetails.textMatches[0].snippet, documentSearchTerm)}
                                              </p>
                                            )}
                                          </div>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDownload(doc.fileUrl, doc.fileName);
                                            }}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
                                          >
                                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                          </button>
                                        </div>
                                      </div>

                                      {/* Expanded document content */}
                                      {expandedDocId === doc._id && (
                                        <div className="px-4 pb-4 animate-fadeIn">
                                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                                            <div className="flex justify-between items-center mb-2">
                                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Document Content
                                              </h4>
                                              {doc.matchDetails?.score && (
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full dark:bg-blue-900/50 dark:text-blue-300">
                                                  Match Score: {doc.matchDetails.score}
                                                </span>
                                              )}
                                            </div>
                                            <div className="prose prose-sm max-w-none dark:prose-invert">
                                              <div className="bg-white dark:bg-gray-800 rounded border dark:border-gray-600 p-3 overflow-auto max-h-96">
                                                {doc.textContent ? (
                                                  <pre className="whitespace-pre-wrap font-sans">
                                                    {highlightText(doc.textContent, documentSearchTerm)}
                                                  </pre>
                                                ) : (
                                                  <p className="text-gray-500 dark:text-gray-400 italic">
                                                    No text content available
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}
                                    </React.Fragment>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};

export default ClaimQueryMatrix;
 