// Frontend matchingLogic.js - Simplified to only handle API calls

export const findMatchingClaims = async (documentEntities, OcrId) => {
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

        const matchData = await response.json();
        console.log('Raw match response:', matchData);

        // Format the match data for saving
        const formattedMatchData = {
            topScore: matchData.topScore,
            totalMatches: matchData.totalMatches,
            matchResults: matchData.matchResults.map(match => ({
                score: match.score,
                matchedFields: match.matches?.matchedFields || [],
                confidence: match.matches?.details || {},
                claim: {
                    claimNumber: match.claim?.claimNumber,
                    name: match.claim?.name,
                    physicianName: match.claim?.physicianName,
                    dateOfInjury: match.claim?.dateOfInjury,
                    employerName: match.claim?.employerName
                },
                isRecommended: match.isRecommended
            }))
        };

        if (OcrId) {
            const saveResponse = await fetch('http://localhost:4000/ai/match-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    OcrId,
                    matchResults: formattedMatchData
                }),
            });

            if (!saveResponse.ok) {
                console.error('Failed to save match history');
            }
        }

        // For AI Processor compatibility, return matchResults array
        if (matchData.matchResults) {
            console.log('Match results received:', matchData.matchResults);
            console.log('Total Matches:', matchData.totalMatches);
            console.log('Top Score:', matchData.topScore);
            console.log('Match Details:', matchData.matchResults.map(match => ({
                claimNumber: match.claim.claimNumber,
                name: match.claim.name,
                score: match.score,
                matchedFields: match.matchedFields
            })));
            return matchData.matchResults;
        }

        return [];
    } catch (error) {
        console.error('Error in findMatchingClaims:', error);
        return [];
    }
};

// Add a new function for getting detailed match data
export const getDetailedMatches = async (documentEntities, OcrId) => {
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

        const matchData = await response.json();
        console.log('Detailed match data:', matchData);

        // Save match history if OcrId is provided
        if (OcrId) {
            console.log('Saving detailed match history for OcrId:', OcrId);
            const saveResponse = await fetch('http://localhost:4000/ai/match-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    OcrId,
                    matchResults: matchData
                }),
            });

            if (!saveResponse.ok) {
                console.error('Failed to save detailed match history');
            }
        }

        return {
            matchResults: matchData.matchResults || [],
            totalMatches: matchData.totalMatches || 0,
            topScore: matchData.topScore || 0
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

// Add function to retrieve match history
export const getMatchHistory = async (OcrId) => {
    try {
        console.log('Fetching match history for OcrId:', OcrId);
        const response = await fetch(`http://localhost:4000/ai/match-history/${OcrId}`);
        if (!response.ok) {
            throw new Error('Failed to fetch match history');
        }
        const data = await response.json();
        console.log('Retrieved match history:', data);
        return data;
    } catch (error) {
        console.error('Error fetching match history:', error);
        return null;
    }
};

export const saveUpdatedEntities = async (OcrId, updatedEntities) => {
    try {
        const response = await fetch('http://localhost:4000/ai/save-updated-entities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ OcrId, updatedEntities }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save updated entities');
        }

        const data = await response.json();
        console.log('Entities saved successfully:', data);
        return data;
    } catch (error) {
        console.error('Error saving updated entities:', error);
        throw error;
    }
};