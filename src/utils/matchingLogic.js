// Frontend matchingLogic.js - Simplified to only handle API calls

export const findMatchingClaims = async (documentEntities) => {
    try {
        console.log('Sending entities to backend for matching:', documentEntities);
        
        const response = await fetch('http://localhost:4000/ai/match-claims', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entities: documentEntities }),
        });

        if (!response.ok) {
            console.error('Match-claims response not OK:', response.status);
            throw new Error('Failed to find matching claims');
        }

        const data = await response.json();
        console.log('Raw match response:', data);
        
        // For AI Processor compatibility, return matchResults array
        if (data.matchResults) {
            console.log('Match results received:', data.matchResults);
            console.log('Total Matches:', data.totalMatches);
            console.log('Top Score:', data.topScore);
            console.log('Match Details:', data.matchResults.map(match => ({
                claimNumber: match.claim.claimNumber,
                name: match.claim.name,
                score: match.score,
                matchedFields: match.matchedFields
            })));
            return data.matchResults;
        }
        
        return [];
    } catch (error) {
        console.error('Error in findMatchingClaims:', error);
        return [];
    }
};

// Add a new function for getting detailed match data
export const getDetailedMatches = async (documentEntities) => {
    try {
        const response = await fetch('http://localhost:4000/ai/match-claims', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ entities: documentEntities }),
        });

        if (!response.ok) {
            throw new Error('Failed to find matching claims');
        }

        const data = await response.json();
        console.log('Detailed match data:', data);

        return {
            matchResults: data.matchResults || [],
            totalMatches: data.totalMatches || 0,
            topScore: data.topScore || 0
        };
    } catch (error) {
        console.error('Error in getDetailedMatches:', error);
        return {
            matchResults: [],
            totalMatches: 0,
            topScore: 0
        };
    }
};