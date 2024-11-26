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
        console.log('Match results received:', data.matchResults);
        console.log('Total Matches:', data.totalMatches);
        console.log('Top Score:', data.topScore);
        return data.matchResults || [];
    } catch (error) {
        console.error('Error in findMatchingClaims:', error);
        throw error;
    }
};