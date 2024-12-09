import React, { useState, useContext, useEffect } from 'react';
import { MatchContext } from '../matchcontext/MatchContext';
import AiProcessor from '../aiprocessor/AiProcessor';
import DocumentDashboard from '../documentdatatable/documentdashboard/DocumentDashboard';
import SuggestedClaims from '../suggestedclaims/SuggestedClaims';
import MatchScoreIndicator from '../suggestedclaims/MatchScoreIndicator';
import DocumentSortManager from '../documentsort/DocumentSortManager';
import ModelMetrics from '../modelmetrics/ModelMetrics';

function AILab() {
    const [selectedOcrId, setSelectedOcrId] = useState(null);
    const [ocrText, setOcrText] = useState('');
    const [selectedDocument, setSelectedDocument] = useState(null);
    const [matchResults, setMatchResults] = useState([]);
    const [processingEnabled, setProcessingEnabled] = useState(true);
    const [selectedDocuments, setSelectedDocuments] = useState([]);
    const [sortResults, setSortResults] = useState({});
    const [documentMatchResults, setDocumentMatchResults] = useState({});
    const [bulkSortStatus, setBulkSortStatus] = useState({
        processing: false,
        status: 'pending',
        results: null
    });

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

    const handleDocumentSelect = (document) => {
        if (!document?.OcrId) {
            console.warn('Document missing OcrId:', document);
            return;
        }
        setSelectedDocument(document);
    };


    const handleDocumentForSuggestions = async (document) => {
        try {
            // Fetch OCR text if not available
            let textContent = document.textContent;
            if (!textContent) {
                const ocrResponse = await fetch(`http://localhost:4000/dms/ocr-text/${document.OcrId}`);
                if (ocrResponse.ok) {
                    const ocrData = await ocrResponse.json();
                    textContent = ocrData.textContent;
                }
            }

            // Get match history
            const historyResponse = await fetch(`http://localhost:4000/ai/match-history/${document.OcrId}`);
            if (historyResponse.ok) {
                const { matchHistory, bestMatch } = await historyResponse.json();
                
                // Update document match results
                setDocumentMatchResults(prev => ({
                    ...prev,
                    [document.OcrId]: {
                        matchHistory,
                        bestMatch: {
                            score: bestMatch?.score || 0,
                            claimId: bestMatch?.claimId,
                            matchDetails: bestMatch?.matchDetails || {},
                            matchedFields: bestMatch?.matchedFields || [],
                            confidence: bestMatch?.confidence || 0
                        }
                    }
                }));
            }
        } catch (error) {
            console.error('Error processing document for suggestions:', error);
        }
    };

    const handleDocumentsSelection = async (documents) => {
        console.log('Processing selected documents:', documents);
        setSelectedDocuments(documents);
        
        // Clear previous match results
        setDocumentMatchResults({});
        
        // Process each document for match results
        for (const doc of documents) {
            if (doc.OcrId) {
                try {
                    // Fetch match history for each document
                    const response = await fetch(`http://localhost:4000/ai/document-match-details/${doc.OcrId}`);
                    if (!response.ok) {
                        throw new Error(`Failed to fetch match details for OcrId: ${doc.OcrId}`);
                    }
                    
                    const matchData = await response.json();
                    console.log(`Match details for OcrId ${doc.OcrId}:`, matchData);
                    
                    // Update document match results
                    setDocumentMatchResults(prev => ({
                        ...prev,
                        [doc.OcrId]: matchData
                    }));
                } catch (error) {
                    console.error(`Error processing document ${doc.OcrId}:`, error);
                }
            }
        }
    };

    const handleDocumentClick = (document) => {
        if (!document.OcrId) {
            console.error('Document OcrId is undefined');
            return;
        }
        setSelectedDocument(document);
    };

    const handleSortComplete = (documentId, result) => {
        setSortResults(prev => ({
            ...prev,
            [documentId]: result
        }));
    };

    const handleBulkSortComplete = (results) => {
        setBulkSortStatus(prev => ({
            ...prev,
            processing: false,
            status: 'completed',
            results
        }));
        
        // Refresh document list or update UI as needed
        // You might want to remove sorted documents from the list
        if (results?.successful?.length > 0) {
            setSelectedDocuments(prev => 
                prev.filter(doc => !results.successful.find(r => r.OcrId === doc.OcrId))
            );
        }
    };

    useEffect(() => {
        if (selectedDocument) {
            console.log('AILab received document:', selectedDocument);
            // Trigger processing
        }
    }, [selectedDocument]);

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
{/*                 
                {selectedDocument && (
                    <div className="bg-white p-4 rounded-lg shadow">
                        <DocumentSortManager
                            document={selectedDocument}
                            onSortComplete={(result) => handleSortComplete(selectedDocument.OcrId, result)}
                        />
                    </div>
                )} */}
                
                <SuggestedClaims 
                    selectedDocument={selectedDocument}
                    selectedDocuments={selectedDocuments}
                    matchResults={matchResults}
                    fileName={selectedDocument?.fileName}
                    documentMatchResults={documentMatchResults}
                    processingEnabled={processingEnabled}
                    bulkSortStatus={bulkSortStatus}
                    onBulkSortComplete={handleBulkSortComplete}
                    sortResults={sortResults}
                    ai
                />
                <DocumentDashboard
                    onSelectDocument={handleSelectDocument}
                    onSelectDocumentII={handleSelectDocumentII}
                    onSelectionChange={handleDocumentsSelection}
                    processingEnabled={processingEnabled}
                    sortResults={sortResults[selectedDocument?.OcrId]}
                    selectedDocuments={selectedDocuments}
                    setSelectedDocuments={setSelectedDocuments}
                />
                <ModelMetrics />
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

export default React.memo(AILab);