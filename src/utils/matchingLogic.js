const SCORE_WEIGHTS = {
    CLAIM_NUMBER: 30,
    NAME: 30,
    DATE_OF_INJURY: 20,
    // Additional scoring factors could be added here
    EMPLOYER_NAME: 15,
    INJURY_DESCRIPTION: 20,
    PHYSICIAN_NAME: 15
};

const normalizeString = (str) => {
    return str.toLowerCase()
        .replace(/[^a-z0-9]/g, '') // Remove special characters
        .trim();
};

const normalizeDate = (dateStr) => {
    // Handle various date formats
    try {
        // Remove any non-numeric characters
        const numericOnly = dateStr.replace(/\D/g, '');
        
        // Assuming format MMDDYYYY or MMDDYY
        if (numericOnly.length === 8 || numericOnly.length === 6) {
            const month = numericOnly.substring(0, 2);
            const day = numericOnly.substring(2, 4);
            const year = numericOnly.substring(4);
            return `${month}${day}${year}`;
        }
        return numericOnly;
    } catch (error) {
        console.error('Date normalization error:', error);
        return dateStr;
    }
};

export const calculateDocumentMatchScore = (documentEntities, claim) => {
    let totalScore = 0;
    const matches = {
        matchedFields: [],
        details: {}
    };

    // Check Claim Number Match
    if (documentEntities.potentialClaimNumbers?.length > 0) {
        const normalizedClaimNumber = normalizeString(claim.claimnumber);
        const hasClaimMatch = documentEntities.potentialClaimNumbers.some(
            docClaimNum => normalizeString(docClaimNum) === normalizedClaimNumber
        );
        
        if (hasClaimMatch) {
            totalScore += SCORE_WEIGHTS.CLAIM_NUMBER;
            matches.matchedFields.push('claimNumber');
            matches.details.claimNumber = claim.claimnumber;
        }
    }

    // Check Name Match
    if (documentEntities.potentialClaimantNames?.length > 0) {
        const normalizedClaimName = normalizeString(claim.name);
        const hasNameMatch = documentEntities.potentialClaimantNames.some(
            docName => normalizeString(docName) === normalizedClaimName
        );
        
        if (hasNameMatch) {
            totalScore += SCORE_WEIGHTS.NAME;
            matches.matchedFields.push('name');
            matches.details.name = claim.name;
        }
    }

    // Check Date of Injury Match
    if (documentEntities.potentialDatesOfInjury?.length > 0) {
        const claimDateOfInjury = normalizeDate(new Date(claim.date).toLocaleDateString());
        const hasDateMatch = documentEntities.potentialDatesOfInjury.some(
            docDate => normalizeDate(docDate) === claimDateOfInjury
        );
        
        if (hasDateMatch) {
            totalScore += SCORE_WEIGHTS.DATE_OF_INJURY;
            matches.matchedFields.push('dateOfInjury');
            matches.details.dateOfInjury = claim.date;
        }
    }

    return {
        score: totalScore,
        matches,
        isRecommended: totalScore >= 75,
        claim: {
            id: claim._id,
            claimNumber: claim.claimnumber,
            name: claim.name,
            date: claim.date,
            adjuster: claim.adjuster
        }
    };
};

export const findMatchingClaims = async (documentEntities) => {
    try {
        // Fetch all claims from your API
        const response = await fetch('http://localhost:4000/claims');
        const claims = await response.json();

        // Calculate match scores for each claim
        const matchResults = claims.map(claim => calculateDocumentMatchScore(documentEntities, claim))
            .filter(result => result.isRecommended) // Only keep matches above threshold
            .sort((a, b) => b.score - a.score); // Sort by score descending

        return matchResults;
    } catch (error) {
        console.error('Error finding matching claims:', error);
        throw error;
    }
}; 