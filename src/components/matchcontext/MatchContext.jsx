import React, { createContext, useContext, useState } from 'react';

const MatchContext = createContext();

export const MatchProvider = ({ children }) => {
    const [matchScores, setMatchScores] = useState({});
    const [suggestedMatches, setSuggestedMatches] = useState([]);
    const [selectedMatch, setSelectedMatch] = useState(null);

    const calculateMatchScores = async (documentData) => {
        try {
            // Initial scoring implementation
            const { entities } = documentData;
            
            // Fetch active claims for comparison
            const response = await fetch('http://localhost:4000/dms/claims/active');
            const claims = await response.json();
            
            // Calculate scores for each claim
            const matches = claims.map(claim => {
                // Calculate individual scores
                const claimNumberMatch = entities.claimNumbers.includes(claim.claimNumber) ? 30 : 0;
                
                // Name matching logic
                const nameMatch = calculateNameMatch(entities.claimantNames, claim.firstName, claim.lastName);
                
                // Date matching logic
                const dateMatch = calculateDateMatch(entities.datesOfInjury, claim.dateOfInjury);
                
                const totalScore = claimNumberMatch + nameMatch + dateMatch;

                return {
                    claimId: claim._id,
                    claimNumber: claim.claimNumber,
                    claimantName: `${claim.firstName} ${claim.lastName}`,
                    dateOfInjury: claim.dateOfInjury,
                    scores: {
                        claimNumberMatch,
                        nameMatch,
                        dateMatch
                    },
                    totalScore
                };
            });

            // Sort by score and filter matches above threshold
            const sortedMatches = matches
                .sort((a, b) => b.totalScore - a.totalScore)
                .filter(match => match.totalScore >= 75);

            return sortedMatches;
        } catch (error) {
            console.error('Error calculating match scores:', error);
            return [];
        }
    };

    // Helper function for name matching
    const calculateNameMatch = (extractedNames, firstName, lastName) => {
        const fullName = `${firstName} ${lastName}`.toLowerCase();
        
        for (const extractedName of extractedNames) {
            const normalizedName = extractedName.toLowerCase();
            if (normalizedName === fullName) return 30;
            if (normalizedName.includes(firstName.toLowerCase())) return 15;
            if (normalizedName.includes(lastName.toLowerCase())) return 15;
        }
        return 0;
    };

    // Helper function for date matching
    const calculateDateMatch = (extractedDates, claimDate) => {
        const claimDateObj = new Date(claimDate);
        
        for (const extractedDate of extractedDates) {
            const extractedDateObj = new Date(extractedDate);
            if (extractedDateObj.getTime() === claimDateObj.getTime()) return 20;
        }
        return 0;
    };

    return (
        <MatchContext.Provider value={{
            matchScores,
            suggestedMatches,
            selectedMatch,
            setSelectedMatch,
            calculateMatchScores,
        }}>
            {children}
        </MatchContext.Provider>
    );
};

export const useMatch = () => {
    const context = useContext(MatchContext);
    if (!context) {
        throw new Error('useMatch must be used within a MatchProvider');
    }
    return context;
};

export default MatchProvider; 