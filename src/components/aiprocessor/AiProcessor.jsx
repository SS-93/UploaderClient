import React, { useState, useEffect } from 'react'
import { performNER } from './openaiservices'
import AllClaims from '../allclaims/AllClaims';

function AiProcessor({ selectedOcrId, ocrText }) {
  const [entities, setEntities] = useState(null);
  const [editableEntities, setEditableEntities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (ocrText) {
      setIsLoading(true);
      const textToProcess = typeof ocrText === 'object' ? 
        ocrText.textContent || '' : 
        ocrText;
      
      performNER(textToProcess)
        .then(result => {
          setEntities(result);
          setEditableEntities(result);
          setIsLoading(false);
        })
        .catch(error => {
          console.error('Error performing NER:', error);
          setIsLoading(false);
        });
    } else {
      setEntities(null);
      setEditableEntities(null);
    }
  }, [ocrText]);

  useEffect(() => {
    if (entities) {
      setEditableEntities({
        potentialClaimNumbers: entities.potentialClaimNumbers || [],
        potentialClaimantNames: entities.potentialClaimantNames || [],
        potentialEmployerNames: entities.potentialEmployerNames || [],
        potentialInsurerNames: entities.potentialInsurerNames || [],
        potentialMedicalProviderNames: entities.potentialMedicalProviderNames || [],
        potentialPhysicianNames: entities.potentialPhysicianNames || [],
        potentialDatesOfBirth: entities.potentialDatesOfBirth || [],
        potentialDatesOfInjury: entities.potentialDatesOfInjury || [],
        potentialInjuryDescriptions: entities.potentialInjuryDescriptions || []
      });
    }
  }, [entities]);

  const renderEntities = () => {
    if (!editableEntities) return null;

    return (
      <div>
        {Object.entries(editableEntities).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="text-lg font-semibold capitalize">{category.replace('_', ' ')}</h3>
            <ul className="list-disc pl-5">
              {items.map((item, index) => (
                <li key={index}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => handleEntityChange(category, index, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 w-full"
                    />
                  ) : (
                    item
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      console.log('Sending entities:', editableEntities);  // Add this line
      const response = await fetch('http://localhost:4000/ai/save-entities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          OcrId: selectedOcrId,
          updatedEntities: editableEntities
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save updated entities');
      }

      const result = await response.json();
      setEntities(editableEntities);
      setIsEditing(false);
      console.log('Entities updated successfully:', result.message);
    } catch (error) {
      console.error('Error saving updated entities:', error);
      alert('Failed to save updated entities');
    }
  };

  const handleCancel = () => {
    setEditableEntities(entities);
    setIsEditing(false);
  };

  const handleEntityChange = (category, index, value) => {
    setEditableEntities(prev => {
      const newEntities = {
        ...prev,
        [category]: prev[category].map((item, i) => i === index ? value : item)
      };
      console.log('Updated entities:', newEntities);  // Add this line
      return newEntities;
    });
  };

  const renderDocument = (doc) => {
    if (!doc) return null;
    
    // Handle string input
    if (typeof doc === 'string') {
      return <pre className="whitespace-pre-wrap">{doc}</pre>;
    }

    // Handle object input
    const content = doc.textContent || 'No content available';
    return (
      <div className="space-y-4">
        {doc.fileName && (
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">{doc.fileName}</h3>
            {doc.category && (
              <span className="text-sm bg-gray-100 rounded-full px-3 py-1">
                {doc.category}
              </span>
            )}
          </div>
        )}
        <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
          {content}
        </pre>
      </div>
    );
  };

  return (
    <div>
      <div>AiProcessor</div>
      <div>
        <section className="bg-white dark:bg-gray-900">
          <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16">
            <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 md:p-12 mb-8">
              <a
                href="#"
                className="bg-blue-100 text-blue-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-blue-400 mb-2"
              >
                <svg
                  className="w-2.5 h-2.5 me-1.5"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 20 14"
                >
                  <path d="M11 0H2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2Zm8.585 1.189a.994.994 0 0 0-.9-.138l-2.965.983a1 1 0 0 0-.685.949v8a1 1 0 0 0 .675.946l2.965 1.02a1.013 1.013 0 0 0 1.032-.242A1 1 0 0 0 20 12V2a1 1 0 0 0-.415-.811Z" />
                </svg>
                MATCHES
              </a>
              <h1 className="text-gray-900 dark:text-white text-3xl md:text-5xl font-extrabold mb-2">
                Potential Claim Matches
              </h1>
              <AllClaims/>  
              <p className="text-lg font-normal text-gray-500 dark:text-gray-400 mb-6">
                Selected Document OCR ID: {selectedOcrId || 'No document selected'}
              </p>
              <a
                href="#"
                className="inline-flex justify-center items-center py-2.5 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
              >
                Read more
                <svg
                  className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 10"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 5h12m0 0L9 1m4 4L9 9"
                  />
                </svg>
              </a>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* First Card - TEXT CONTENT */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 md:p-12">
                <a
                  href="#"
                  className="bg-green-100 text-green-800 text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md dark:bg-gray-700 dark:text-green-400 mb-2"
                >
                  <svg
                    className="w-2.5 h-2.5 me-1.5"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 18 18"
                  >
                    <path d="M17 11h-2.722L8 17.278a5.512 5.512 0 0 1-.9.722H17a1 1 0 0 0 1-1v-5a1 1 0 0 0-1-1ZM6 0H1a1 1 0 0 0-1 1v13.5a3.5 3.5 0 1 0 7 0V1a1 1 0 0 0-1-1ZM3.5 15.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2ZM16.132 4.9 12.6 1.368a1 1 0 0 0-1.414 0L9 3.55v9.9l7.132-7.132a1 1 0 0 0 0-1.418Z" />
                  </svg>
                  OCR ID: {selectedOcrId || 'N/A'}
                </a>
                <h2 className="text-gray-900 dark:text-white text-3xl font-extrabold mb-2">
                  TEXT CONTENT
                </h2>
                <div className="text-gray-500 dark:text-gray-400 text-sm max-h-60 overflow-y-auto">
                  {renderDocument(ocrText)}
                </div>
              </div>
              {/* Second Card - EXTRACTED ENTITIES */}
              <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 md:p-12">
                <h2 className="text-gray-900 dark:text-white text-3xl font-extrabold mb-2">
                  EXTRACTED ENTITIES
                </h2>
                <div className="text-lg font-normal text-gray-500 dark:text-gray-400 mb-4 max-h-60 overflow-y-auto">
                  {isLoading ? (
                    <p>Loading entities...</p>
                  ) : editableEntities ? (
                    <>
                      {renderEntities()}
                      <div className="mt-4">
                        {isEditing ? (
                          <>
                            <button onClick={handleSave} className="bg-green-500 text-white px-4 py-2 rounded mr-2">Save</button>
                            <button onClick={handleCancel} className="bg-red-500 text-white px-4 py-2 rounded">Cancel</button>
                          </>
                        ) : (
                          <button onClick={handleEdit} className="bg-blue-500 text-white px-4 py-2 rounded">Edit</button>
                        )}
                      </div>
                    </>
                  ) : (
                    <p>No entities extracted yet</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* <ParkingSession /> */}
      </div>
    </div>
  )
}

export default AiProcessor
