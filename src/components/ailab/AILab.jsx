import React, { useState, useContext } from 'react';
import { MatchContext } from '../matchcontext/MatchContext';
import AiProcessor from '../aiprocessor/AiProcessor';
import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard';
import SuggestedClaims from '../suggestedclaims/SuggestedClaims';
import MatchScoreIndicator from '../suggestedclaims/MatchScoreIndicator';

function AILab() {
    const [selectedOcrId, setSelectedOcrId] = useState(null);
    const [ocrText, setOcrText] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [matchResults, setMatchResults] = useState([]);
    const [processingEnabled, setProcessingEnabled] = useState(true);

    const { 
        findMatches,
        getMatchHistory,
        loading,
        error 
    } = useContext(MatchContext);

    const handleProcessingToggle = () => {
        setProcessingEnabled(!processingEnabled);
    };

    const handleSelectDocument = async (documentData) => {
        console.log('AILab received document:', documentData);
        
        setSelectedOcrId(documentData.OcrId);
        setSelectedDocument(documentData);
        
        if (documentData.OcrId && processingEnabled) {
            try {
                // If document already has text content, use it
                if (documentData.textContent) {
                    setOcrText({
                        textContent: documentData.textContent,
                        fileName: documentData.fileName,
                        category: documentData.category
                    });

                    // Fetch match history and suggested claims
                    await getMatchHistory(documentData.OcrId);
                    await fetchSuggestedClaims(documentData.OcrId);
                    return;
                }

                // Fallback to fetching OCR text if not present
                const response = await fetch(`http://localhost:4000/dms/ocr-text/${documentData.OcrId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch OCR text');
                }
                const data = await response.json();
                setOcrText({
                    textContent: data.textContent,
                    fileName: data.fileName,
                    category: data.category
                });

                // Fetch match history and suggested claims after getting OCR text
                await getMatchHistory(documentData.OcrId);
                await fetchSuggestedClaims(documentData.OcrId);
            } catch (error) {
                console.error('Error in handleSelectDocument:', error);
                setOcrText({ textContent: 'Failed to load OCR text' });
            }
        }
    };

    const fetchSuggestedClaims = async (OcrId) => {
        try {
            const response = await fetch(`http://localhost:4000/ai/suggested-claims/${OcrId}`);
            if (!response.ok) {
                throw new Error('Failed to fetch suggested claims');
            }
            const data = await response.json();
            
            // Process matches through context
            if (data.documentInfo?.entities) {
                await findMatches(data.documentInfo.entities);
            }

            // Update document with normalized match results
            setSelectedDocument(prevDoc => ({
                ...prevDoc,
                matchResults: data.matchResults?.map(result => ({
                    score: result.score,
                    matches: {
                        matchedFields: result.matches.matchedFields,
                        details: result.matches.details,
                        confidence: result.matches.confidence
                    },
                    isRecommended: result.isRecommended,
                    claim: result.claim
                })) || []
            }));
        } catch (error) {
            console.error('Error fetching suggested claims:', error);
        }
    };

    const handleSelectDocumentII = async (document) => {
        setSelectedDocument(document);
        setSelectedOcrId(document.OcrId);
        if (document.OcrId) {
            try {
                const response = await fetch(`http://localhost:4000/dms/ocr-text/${document.OcrId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch OCR text');
                }
                const data = await response.json();
                setOcrText(data.textContent);
                
                // Fetch match history and suggested claims
                await getMatchHistory(document.OcrId);
                await fetchSuggestedClaims(document.OcrId);
            } catch (error) {
                console.error('Error fetching OCR text:', error);
                setOcrText('Failed to load OCR text');
            }
        } else {
            setOcrText('');
        }
    };

    const handleDocumentForSuggestions = async (document) => {
        try {
            const normalizedDocument = {
                OcrId: document.OcrId,
                fileName: document.fileName || 'Untitled Document',
                category: document.category || 'Uncategorized',
                uploadDate: document.uploadDate || new Date().toISOString(),
                textContent: document.textContent || ''
            };

            setSelectedDocument(normalizedDocument);
            
            // Fetch match history and suggested claims for the normalized document
            if (normalizedDocument.OcrId) {
                await getMatchHistory(normalizedDocument.OcrId);
                await fetchSuggestedClaims(normalizedDocument.OcrId);
            }

        } catch (error) {
            console.error('Error processing document for suggestions:', error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold mb-6">AI Lab</h1>
            
            <div className="mb-4 flex justify-end">
                <button
                    onClick={handleProcessingToggle}
                    className={`px-4 py-2 rounded-lg font-medium ${
                        processingEnabled 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-green-500 hover:bg-green-600 text-white'
                    }`}
                >
                    {processingEnabled ? 'Stop Processing' : 'Start Processing'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <AiProcessor 
                    selectedOcrId={selectedOcrId}
                    ocrText={ocrText}
                    processingEnabled={processingEnabled}
                />
                
                {selectedDocument && (
                    <SuggestedClaims 
                        selectedDocument={selectedDocument}
                        matchResults={matchResults}
                        fileName={selectedDocument?.fileName}
                        processingEnabled={processingEnabled}
                    />
                )}
                
                <DocumentDashboard
                    onSelectDocument={handleSelectDocument}
                    onSelectDocumentII={(doc) => {
                        if (processingEnabled) {
                            handleSelectDocumentII(doc);
                            handleDocumentForSuggestions(doc);
                        } else {
                            // Just update selected document without processing
                            setSelectedDocument(doc);
                            setSelectedOcrId(doc.OcrId);
                        }
                    }}
                />
            </div>

            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
                </div>
            )}

            {error && (
                <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}
        </div>
    );
}

export default AILab;