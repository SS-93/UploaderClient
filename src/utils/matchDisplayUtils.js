// Constants from backend scoring weights
export const SCORE_WEIGHTS = {
    PRIMARY: {
        CLAIM_NUMBER: 30,
        NAME: 25,
        DATE_OF_INJURY: 20
    },
    SECONDARY: {
        EMPLOYER_NAME: 15,
        PHYSICIAN_NAME: 10
    }
};

// Get the status class based on score
export const getStatusClass = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 45) return 'bg-yellow-500';
    return 'bg-red-500';
};

// Get points for each field
export const getFieldPoints = (field) => {
    const fieldMap = {
        'claimNumber': SCORE_WEIGHTS.PRIMARY.CLAIM_NUMBER,
        'name': SCORE_WEIGHTS.PRIMARY.NAME,
        'dateOfInjury': SCORE_WEIGHTS.PRIMARY.DATE_OF_INJURY,
        'employerName': SCORE_WEIGHTS.SECONDARY.EMPLOYER_NAME,
        'physicianName': SCORE_WEIGHTS.SECONDARY.PHYSICIAN_NAME
    };
    return fieldMap[field] || 0;
};

// Format field names for display
export const getFieldLabel = (field) => {
    const fieldLabels = {
        'claimNumber': 'Claim Number',
        'name': 'Claimant Name',
        'dateOfInjury': 'Date of Injury',
        'employerName': 'Employer Name',
        'physicianName': 'Physician Name'
    };
    return fieldLabels[field] || field;
};

// Format field values for display
export const formatFieldValue = (key, value) => {
    if (!value) return 'N/A';

    switch (key) {
        case 'dateOfInjury':
            return new Date(value).toLocaleDateString();
        case 'confidence':
            return `${Math.round(value * 100)}%`;
        default:
            return value;
    }
};

// Calculate total possible score
export const getTotalPossibleScore = () => {
    return Object.values(SCORE_WEIGHTS.PRIMARY).reduce((a, b) => a + b, 0) +
           Object.values(SCORE_WEIGHTS.SECONDARY).reduce((a, b) => a + b, 0);
};

// Format confidence scores for display
export const formatConfidence = (confidence) => {
    if (typeof confidence === 'number') {
        return `${Math.round(confidence * 100)}%`;
    }
    return 'N/A';
};

// Get match quality indicator
export const getMatchQuality = (score) => {
    if (score >= 70) return { label: 'Strong Match', color: 'text-green-600' };
    if (score >= 45) return { label: 'Possible Match', color: 'text-yellow-600' };
    return { label: 'Weak Match', color: 'text-red-600' };
};

// Format match history for display
export const formatMatchHistory = (history) => {
    if (!history) return [];
    
    return history.map(match => ({
        ...match,
        formattedDate: new Date(match.matchedAt).toLocaleString(),
        quality: getMatchQuality(match.score),
        totalFields: match.matchedFields?.length || 0,
        primaryMatches: match.matchedFields?.filter(field => 
            Object.keys(SCORE_WEIGHTS.PRIMARY).includes(field.toUpperCase())
        ).length || 0
    }));
};

// Get field match details
export const getFieldMatchDetails = (field, confidence) => {
    const weight = getFieldPoints(field);
    const score = confidence * weight;
    
    return {
        weight,
        score: Math.round(score * 10) / 10,
        confidence: formatConfidence(confidence),
        isPrimary: Object.keys(SCORE_WEIGHTS.PRIMARY)
            .includes(field.toUpperCase())
    };
};

// Get summary of match results
export const getMatchSummary = (matchDetails) => {
    if (!matchDetails) return null;

    const totalFields = matchDetails.matchedFields?.length || 0;
    const primaryMatches = matchDetails.matchedFields?.filter(field => 
        Object.keys(SCORE_WEIGHTS.PRIMARY).includes(field.toUpperCase())
    ).length || 0;

    return {
        totalFields,
        primaryMatches,
        quality: getMatchQuality(matchDetails.score),
        totalConfidence: matchDetails.matchedFields?.reduce((acc, field) => 
            acc + (matchDetails.confidence[field] || 0), 0) / totalFields || 0
    };
};

// Format field names for display
export const formatFieldName = (key) => {
    const fieldNameMap = {
        claimNumber: 'Claim Number',
        claimantName: 'Claimant Name',
        name: 'Name',
        dateOfInjury: 'Date of Injury',
        employerName: 'Employer Name',
        physicianName: 'Physician Name',
        confidence: 'Confidence',
        score: 'Score',
        matchedAt: 'Matched At',
        isRecommended: 'Recommended',
        injuryDescription: 'Injury Description'
    };

    // Convert camelCase to Title Case if not in map
    if (!fieldNameMap[key]) {
        return key
            .replace(/([A-Z])/g, ' $1') // Add space before capital letters
            .replace(/^./, str => str.toUpperCase()) // Capitalize first letter
            .trim();
    }

    return fieldNameMap[key];
}; 
