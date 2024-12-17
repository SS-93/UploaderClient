import React, { useState, useEffect, useContext } from 'react'
import { performNER } from './openaiservices'
import { findMatchingClaims, saveUpdatedEntities } from '../../utils/matchingLogic'
import { MatchContext } from '../matchcontext/MatchContext'
import AllClaims from '../allclaims/AllClaims';
import SuggestedClaims from '../suggestedclaims/SuggestedClaims';
import MatchDetails from '../claimquerymatrix/MatchDetails';
import SingleDocumentProcessor from '../singledocumentprocessor/SingleDocumentProcessor';
import MatchScoreIndicator from '../suggestedclaims/MatchScoreIndicator';

function AiProcessor({ selectedOcrId, ocrText, processingEnabled }) {
  const [entities, setEntities] = useState(null);
  const [editableEntities, setEditableEntities] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [matchResults, setMatchResults] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  

  const { findMatches, getMatchHistory, matchHistory } = useContext(MatchContext);

  useEffect(() => {
    if (ocrText && selectedOcrId) {
      setSelectedDocument({
        OcrId: selectedOcrId,
        textContent: ocrText,
        fileName: typeof ocrText === 'object' ? ocrText.fileName : 'Document'
      });
    }
  }, [ocrText, selectedOcrId]);

  useEffect(() => {
    if (ocrText && processingEnabled) {
      setIsLoading(true);
      const textToProcess = typeof ocrText === 'object' ? 
        ocrText.textContent || '' : 
        ocrText;
      
      performNER(textToProcess, selectedOcrId)
        .then(result => {
          const extractedEntities = result.entities || {};
          setEntities(extractedEntities);
          setEditableEntities(extractedEntities);
          
          return findMatchingClaims(extractedEntities)
            .then(matches => {
              setMatchResults(matches);
              console.log('Match Results from backend:', matches);
            })
            .catch(error => {
              console.error('Error finding matching claims:', error);
            });
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setEntities(null);
      setEditableEntities(null);
      setMatchResults([]);
    }
  }, [ocrText, selectedOcrId, processingEnabled, findMatches]);

  useEffect(() => {
    if (entities) {
      const newEditableEntities = {
        potentialClaimNumbers: Array.isArray(entities.potentialClaimNumbers) ? entities.potentialClaimNumbers : [],
        potentialClaimantNames: Array.isArray(entities.potentialClaimantNames) ? entities.potentialClaimantNames : [],
        potentialEmployerNames: Array.isArray(entities.potentialEmployerNames) ? entities.potentialEmployerNames : [],
        potentialInsurerNames: Array.isArray(entities.potentialInsurerNames) ? entities.potentialInsurerNames : [],
        potentialMedicalProviderNames: Array.isArray(entities.potentialMedicalProviderNames) ? entities.potentialMedicalProviderNames : [],
        potentialPhysicianNames: Array.isArray(entities.potentialPhysicianNames) ? entities.potentialPhysicianNames : [],
        potentialDatesOfBirth: Array.isArray(entities.potentialDatesOfBirth) ? entities.potentialDatesOfBirth : [],
        potentialDatesOfInjury: Array.isArray(entities.potentialDatesOfInjury) ? entities.potentialDatesOfInjury : [],
        potentialInjuryDescriptions: Array.isArray(entities.potentialInjuryDescriptions) ? entities.potentialInjuryDescriptions : []
      };
      console.log('Setting editableEntities:', newEditableEntities);
      setEditableEntities(newEditableEntities);
    }
  }, [entities]);

  const renderEntities = () => {
    if (!editableEntities) return null;

    console.log('Rendering entities:', editableEntities);

    return (
      <div>
        {Object.entries(editableEntities).map(([category, items]) => (
          <div key={category} className="mb-4">
            <h3 className="text-lg font-semibold capitalize">{category.replace('_', ' ')}</h3>
            <ul className="list-disc pl-5">
              {Array.isArray(items) && items.length > 0 ? (
                items.map((item, index) => (
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
                ))
              ) : (
                <li>No items found.</li>
              )}
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
      console.log('Sending entities:', editableEntities);
      const response = await saveUpdatedEntities(selectedOcrId, editableEntities);
      setEntities(response.entities);
      setMatchResults(response.matchResults);
      setIsEditing(false);
      alert('Entities and match history updated successfully.');
    } catch (error) {
      alert(`Failed to save updates: ${error.message}`);
    }
  };

  const handleCancel = () => {
    setEditableEntities(entities);
    setIsEditing(false);
  };

  const handleEntityChange = (category, index, value) => {
    setEditableEntities(prev => {
      const updatedCategory = [...prev[category]];
      updatedCategory[index] = value;
      return { ...prev, [category]: updatedCategory };
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

  const renderMatchResults = () => {
    if (!matchResults || matchResults.length === 0) {
      return <p>No matches found</p>;
    }

    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Match Results</h3>
        <MatchScoreIndicator 
          selectedOcrId={selectedOcrId}
          matchResults={{
            topScore: matchResults[0]?.score || 0,
            totalMatches: matchResults.length,
            matchResults: matchResults.map(match => ({
              score: match.score,
              matchedFields: match.matches?.matchedFields || [],
              confidence: match.matches?.confidence || {},
              matchDetails: {
                claimNumber: match.claim?.claimNumber,
                claimantName: match.claim?.name,
                physicianName: match.claim?.physicianName,
                dateOfInjury: match.claim?.dateOfInjury,
                employerName: match.claim?.employerName
              },
              isRecommended: match.isRecommended
            }))
          }}
        />
        {matchResults.map((match, index) => (
          <div key={index} className="border rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-medium">Claim: {match.claim.claimNumber}</h4>
              <span className="text-sm text-gray-500">Score: {match.score}%</span>
            </div>
            {/* <MatchDetails matchDetails={match} /> */}
          </div>
        ))}
      </div>
    );
  };

  const SaveMatchResultsForm = ({ matchResults, selectedOcrId, onSave }) => {
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const response = await fetch('http://localhost:4000/ai/match-history', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            OcrId: selectedOcrId,
            matchResults: {
              topScore: matchResults.topScore,
              totalMatches: matchResults.totalMatches,
              matchResults: matchResults.matchResults?.map(match => ({
                score: match.score,
                matchedFields: match.matches?.matchedFields || [],
                confidence: match.matches?.confidence || {},
                matchDetails: {
                  claimNumber: match.claim?.claimNumber,
                  claimantName: match.claim?.name,
                  physicianName: match.claim?.physicianName,
                  dateOfInjury: match.claim?.dateOfInjury,
                  employerName: match.claim?.employerName
                },
                claim: {
                  claimNumber: match.claim?.claimNumber,
                  name: match.claim?.name,
                  physicianName: match.claim?.physicianName,
                  dateOfInjury: match.claim?.dateOfInjury,
                  employerName: match.claim?.employerName
                },
                isRecommended: match.isRecommended
              }))
            }
          })
        });

        if (!response.ok) {
          throw new Error('Failed to save match results');
        }

        const data = await response.json();
        console.log('Match results saved:', data);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000); // Hide after 3 seconds
        onSave && onSave(data);
    } catch (error) {
        console.error('Error saving match results:', error);
    }
};


    return (
      <div className="mt-4 p-4 bg-white rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Save Match Results</h3>
        {showSuccess && (
                <div className="mb-4 p-1.5 bg-green-100 border border-green-400 text-green-700 rounded flex items-center text-sm">
                <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                </svg>
                Match Results Saved Successfully
            </div>
            )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Top Score: {matchResults.topScore}%
            </p>
            <p className="text-sm text-gray-600">
              Total Matches: {matchResults.totalMatches}
            </p>
          </div>
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Save Match Results
          </button>
        </form>
      </div>
    );
  };

  return (
    <div>
      <div>AiProcessor</div>
      <div>
        <section className="bg-white dark:bg-gray-900">
          <div className="py-8 px-4 mx-auto max-w-screen-xl lg:py-16">
            <div className="mb-8">
              {/* <SuggestedClaims 
                selectedDocument={selectedDocument}
                matchResults={matchResults}
              />
              <SingleDocumentProcessor
                selectedDocument={selectedDocument}
                matchResults={matchResults}
              /> */}
            </div>
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
              <div className="mt-4">
                {isLoading ? (
                  <p>Loading matches...</p>
                ) : (
                  renderMatchResults()
                )}
              </div>
              {matchResults && matchResults.length > 0 && (
                <SaveMatchResultsForm
                  matchResults={{
                    topScore: matchResults[0]?.score || 0,
                    totalMatches: matchResults.length,
                    matchResults: matchResults.matchResults?.map(match => ({
                      score: match.score,
                      matchedFields: match.matches?.matchedFields || [],
                      confidence: match.matches?.confidence || {},
                      matchDetails: { 
                        claimNumber: match.claim?.claimNumber,
                        name: match.claim?.name,
                        physicianName: match.claim?.physicianName,
                        dateOfInjury: match.claim?.dateOfInjury,
                        employerName: match.claim?.employerName
                      },
                      isRecommended: match.isRecommended
                    }))
                  }}
                  selectedOcrId={selectedOcrId}
                  onSave={(data) => {
                    console.log('Match results saved successfully:', data);
                    // Optionally update UI or show success message
                  }}
                />
              )}
              {/* <AllClaims/>   */}
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
