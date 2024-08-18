// src/components/AgnosticInterface.js
import React, {useState, useEffect} from 'react';
import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard';



function AgnosticInterface() {
  const [uploadedDocuments, setUploadedDocuments] = useState([]);
  const [isAddingDocuments, setIsAddingDocuments] = useState(false);

  useEffect(() => {
    fetchNewlyUploadedDocuments(); // Fetch documents when component mounts
  }, []);

  const fetchNewlyUploadedDocuments = async () => {
    try {
      const response = await fetch('http://localhost:4000/dms/recent-uploads');
      if (response.ok) {
        const result = await response.json();
        setUploadedDocuments(result.files); // Set state with the newly fetched documents
      } else {
        console.error('Failed to fetch newly uploaded documents');
      }
    } catch (error) {
      console.error('Error fetching newly uploaded documents:', error);
    }
  };

  const handleUpload = async (files) => {
    const formData = new FormData();
    for (const file of files) {
      formData.append('documents', file);
    }

    try {
      const response = await fetch('http://localhost:4000/dms/bulk-uploads', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        await fetchNewlyUploadedDocuments(); // Fetch the documents again after upload
      } else {
        console.error('Upload failed');
      }
    } catch (error) {
      console.error('Error during upload:', error);
    }
  };

  const handleFileChange = (event) => {
    const files = event.target.files;
    handleUpload(files);
  };
  
  return (
    <div>
      <h1 className="text-2xl font-bold p-4"></h1>
      <div className="p-4">
        <DocumentDashboard
          documents={uploadedDocuments}
          isAddingDocuments={isAddingDocuments}
          setIsAddingDocuments={setIsAddingDocuments}
          onFileChange={handleFileChange}
        />
      </div>
      <div className="fixed bottom-0 left-0 z-50 w-full h-16 bg-white border-t border-gray-200 dark:bg-gray-700 dark:border-gray-600">
        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">

        <div className="grid h-full max-w-lg grid-cols-4 mx-auto font-medium">
          <button
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
            onClick={() => setIsAddingDocuments(true)}
          >
            <svg
              className="w-5 h-5 mb-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M2 6a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2H2zm0 2h16v8H2V8zm7 1a1 1 0 110 2h4a1 1 0 110-2h-4zm-3 4h4a1 1 0 110 2H6a1 1 0 110-2z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">
              Add Documents
            </span>
          </button>
        </div>
        {/* <label className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group cursor-pointer">
            <input type="file" multiple onChange={handleFileChange} className="hidden" />
            <svg className="w-5 h-5 mb-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2H2zm0 2h16v8H2V8zm7 1a1 1 0 110 2h4a1 1 0 110-2h-4zm-3 4h4a1 1 0 110 2H6a1 1 0 110-2z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Upload</span>
          </label> */}
          {/* <button
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <svg className="w-5 h-5 mb-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2H2zm0 2h16v8H2V8zm7 1a1 1 0 110 2h4a1 1 0 110-2h-4zm-3 4h4a1 1 0 110 2H6a1 1 0 110-2z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Bulk Upload</span>
          </button> */}
          {/* <button
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <svg className="w-5 h-5 mb-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V8a2 2 0 00-2-2H2zm0 2h16v8H2V8zm7 1a1 1 0 110 2h4a1 1 0 110-2h-4zm-3 4h4a1 1 0 110 2H6a1 1 0 110-2z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Bulk Upload</span>
          </button> */}
          <button
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <svg className="w-5 h-5 mb-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M12.293 2.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-10 10a1 1 0 01-.293.207l-4 2a1 1 0 01-1.293-1.293l2-4a1 1 0 01.207-.293l10-10zM14 6l-1 1L8 12l-2 2H5v-1l4-4 5-5z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Edit</span>
          </button>
          <button
            type="button"
            className="inline-flex flex-col items-center justify-center px-5 hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            <svg className="w-5 h-5 mb-2 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
              <path d="M7 4a1 1 0 011-1h4a1 1 0 011 1h5a1 1 0 110 2H2a1 1 0 110-2h5zm2 4a1 1 0 00-1 1v7a1 1 0 102 0v-7a1 1 0 00-1-1zm4 0a1 1 0 00-1 1v7a1 1 0 102 0v-7a1 1 0 00-1-1z" />
            </svg>
            <span className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-500">Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgnosticInterface;
