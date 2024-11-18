import React, { useState, useEffect } from 'react';

const AdvancedSearch = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Advanced search operators helper
  const searchOperators = {
    claim: 'claim:',    // search claim number
    adj: 'adj:',        // search adjuster
    doc: 'doc:',        // search document content
    name: 'name:',      // search name
    date: 'date:',      // search date range
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:4000/new/search?query=${encodeURIComponent(searchQuery)}&page=${page}`);
      const data = await response.json();
      
      setSearchResults(data.results);
      setTotalPages(data.pagination.pages);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Highlight matching text
  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    return text.split(regex).map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
      ) : part
    );
  };

  return (
    <div className="p-4">
      <div className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 p-2 border rounded-lg"
            placeholder='Search (e.g., "doc:contract adj:john")'
          />
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {/* Search operators help */}
        <div className="mt-2 text-sm text-gray-600">
          <p>Search operators:</p>
          <ul className="grid grid-cols-2 gap-2 mt-1">
            <li>claim:[number] - search claim number</li>
            <li>adj:[name] - search adjuster</li>
            <li>doc:[text] - search document content</li>
            <li>name:[text] - search name</li>
            <li>date:[YYYY-MM-DD] - search by date</li>
          </ul>
        </div>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {searchResults.map((result) => (
          <div key={result._id} className="border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">
                Claim: {highlightText(result.claimnumber, searchQuery)}
              </h3>
              <span className="text-sm text-gray-500">
                Score: {result.score.toFixed(2)}
              </span>
            </div>
            
            {/* Matching documents */}
            {result.matchingDocuments?.map((doc) => (
              <div key={doc._id} className="mt-2 pl-4 border-l-2 border-gray-200">
                <p className="font-medium">{doc.fileName}</p>
                <div className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                  {/* Preview of matching content */}
                  <p className="line-clamp-3">
                    {highlightText(doc.textContent?.substring(0, 200), searchQuery)}...
                  </p>
                  <button 
                    className="text-blue-600 hover:underline mt-1"
                    onClick={() => {/* TODO: Open full text view */}}
                  >
                    View full text
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 rounded ${
                page === i + 1 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch; 