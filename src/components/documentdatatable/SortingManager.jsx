import React, { useState } from 'react';

const SortingManager = ({ onSort, onAutoSort }) => {
  const [minScore, setMinScore] = useState(75);
  const [batchSize, setBatchSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleAutoSort = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/dms/auto-sort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minScore, batchSize }),
      });

      const data = await response.json();
      if (response.ok) {
        onAutoSort(data.results);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Auto-sort failed:', error);
      alert('Failed to auto-sort documents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Document Sorting</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Minimum Match Score
          </label>
          <input
            type="number"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Batch Size
          </label>
          <input
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            min="1"
            max="50"
          />
        </div>

        <button
          onClick={handleAutoSort}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Auto-Sort Documents'}
        </button>
      </div>
    </div>
  );
};

export default SortingManager; 

const SortingManager = ({ onSort, onAutoSort }) => {
  const [minScore, setMinScore] = useState(75);
  const [batchSize, setBatchSize] = useState(10);
  const [loading, setLoading] = useState(false);

  const handleAutoSort = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/dms/auto-sort', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minScore, batchSize }),
      });

      const data = await response.json();
      if (response.ok) {
        onAutoSort(data.results);
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error('Auto-sort failed:', error);
      alert('Failed to auto-sort documents: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Document Sorting</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Minimum Match Score
          </label>
          <input
            type="number"
            value={minScore}
            onChange={(e) => setMinScore(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            min="0"
            max="100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Batch Size
          </label>
          <input
            type="number"
            value={batchSize}
            onChange={(e) => setBatchSize(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            min="1"
            max="50"
          />
        </div>

        <button
          onClick={handleAutoSort}
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Processing...' : 'Auto-Sort Documents'}
        </button>
      </div>
    </div>
  );
};

export default SortingManager; 