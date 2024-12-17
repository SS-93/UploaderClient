export const performNER = async (text, OcrId) => {
    try {
        console.log('Sending NER request:', {
            textLength: text.length,
            OcrId
        });

        const response = await fetch('http://localhost:4000/ai/perform-ner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                text, 
                OcrId,
                modelName: 'gpt-3.5-turbo' // Explicitly specify model
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('NER Error Response:', data);
            throw new Error(data.error || data.details || 'Failed to perform NER');
        }

        console.log('NER Response:', data);

        return {
            entities: data.entities || {
                potentialClaimNumbers: [],
                potentialClaimantNames: [],
                potentialEmployerNames: [],
                potentialInsurerNames: [],
                potentialMedicalProviderNames: [],
                potentialPhysicianNames: [],
                potentialDatesOfBirth: [],
                potentialDatesOfInjury: [],
                potentialInjuryDescriptions: []
            },
            matchResults: data.matchResults || [],
            document: data.document,
            performanceMetrics: data.performanceMetrics
        };
    } catch (error) {
        console.error('Error performing NER:', {
            message: error.message,
            OcrId
        });
        throw error;
    }
};

export const saveUpdatedEntities = async (OcrId, updatedEntities) => {
    try {
        const response = await fetch('http://localhost:4000/ai/save-entities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ OcrId, updatedEntities }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to save entities');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving entities:', error);
        throw error;
    }
};

// Add new function to handle match score display
export const getMatchScoreClass = (score) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
};

// Add function to format match details
export const formatMatchDetails = (matchResults) => {
    if (!matchResults || !matchResults.length) return [];
    
    return matchResults.map(match => ({
        ...match,
        formattedScore: Math.round(match.score),
        scoreClass: getMatchScoreClass(match.score),
        matchedFields: match.matchedFields || [],
        confidence: match.confidence || {}
    }));
};