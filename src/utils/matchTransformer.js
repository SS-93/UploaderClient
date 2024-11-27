export const transformMatchResults = (matchResults) => {
    if (!Array.isArray(matchResults)) return [];
    
    return matchResults.map(match => ({
        score: match.score || 0,
        matches: {
            matchedFields: match.matchedFields || [],
            details: {
                claimNumber: { 
                    matched: match.matches?.claimNumber?.matched || false, 
                    score: match.matches?.claimNumber?.score || 0 
                },
                name: { 
                    matched: match.matches?.name?.matched || false, 
                    score: match.matches?.name?.score || 0 
                },
                employerName: { 
                    matched: match.matches?.employerName?.matched || false, 
                    score: match.matches?.employerName?.score || 0 
                },
                dateOfInjury: { 
                    matched: match.matches?.dateOfInjury?.matched || false, 
                    score: match.matches?.dateOfInjury?.score || 0 
                },
                injuryDescription: { 
                    matched: match.matches?.injuryDescription?.matched || false, 
                    score: match.matches?.injuryDescription?.score || 0 
                }
            }
        },
        claim: {
            claimNumber: match.claim?.claimNumber || '',
            name: match.claim?.name || '',
            employerName: match.claim?.employerName || '',
            dateOfInjury: match.claim?.dateOfInjury || '',
            physicianName: match.claim?.physicianName || ''
        },
        isRecommended: match.score >= 75 // Using 75 as threshold based on backend
    }));
}; 