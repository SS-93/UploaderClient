import natural from 'natural';
import { parse, format } from 'date-fns';
import _ from 'lodash';

const { JaroWinklerDistance } = natural;

// Scoring weights configuration
export const SCORE_WEIGHTS = {
    CLAIM_NUMBER: 30,
    NAME: 30,
    DATE_OF_INJURY: 20,
    EMPLOYER_NAME: 15,
    INJURY_DESCRIPTION: 20,
    PHYSICIAN_NAME: 15
};

// Utility functions
const normalizeString = (str) => {
    if (!str) return '';
    return str.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
};

const normalizeDate = (dateStr) => {
    try {
        const parsedDate = parse(dateStr, 'MM/dd/yyyy', new Date());
        return format(parsedDate, 'MMddyyyy');
    } catch (error) {
        console.error('Date normalization error:', error);
        return dateStr;
    }
};

const calculateTFIDF = (documents) => {
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    documents.forEach(doc => {
        if (doc) tfidf.addDocument(normalizeString(doc));
    });

    return tfidf;
};

// Main scoring function
export const calculateDocumentMatchScore = (documentEntities, claim) => {
    if (!documentEntities || !claim) {
        console.error('Missing required parameters for score calculation');
        return null;
    }

    let totalScore = 0;
    const matches = {
        matchedFields: [],
        details: {},
        confidence: {}
    };

    // Claim Number Matching
    if (documentEntities.potentialClaimNumbers?.length > 0) {
        const normalizedClaimNumber = normalizeString(claim.claimnumber);
        const bestMatch = Math.max(...documentEntities.potentialClaimNumbers.map(
            docClaimNum => normalizeString(docClaimNum) === normalizedClaimNumber ? 1 : 0
        ));

        if (bestMatch === 1) {
            totalScore += SCORE_WEIGHTS.CLAIM_NUMBER;
            matches.matchedFields.push('claimNumber');
            matches.details.claimNumber = claim.claimnumber;
            matches.confidence.claimNumber = 1;
        }
    }

    // Name Matching with Fuzzy Logic
    if (documentEntities.potentialClaimantNames?.length > 0) {
        const normalizedClaimName = normalizeString(claim.name);
        const bestNameMatch = Math.max(...documentEntities.potentialClaimantNames.map(
            docName => JaroWinklerDistance(normalizeString(docName), normalizedClaimName)
        ));

        if (bestNameMatch > 0.9) {
            totalScore += SCORE_WEIGHTS.NAME * bestNameMatch;
            matches.matchedFields.push('name');
            matches.details.name = claim.name;
            matches.confidence.name = bestNameMatch;
        }
    }

    // Date Matching
    if (documentEntities.potentialDatesOfInjury?.length > 0) {
        const claimDateOfInjury = normalizeDate(new Date(claim.date).toLocaleDateString());
        const hasDateMatch = documentEntities.potentialDatesOfInjury.some(
            docDate => normalizeDate(docDate) === claimDateOfInjury
        );

        if (hasDateMatch) {
            totalScore += SCORE_WEIGHTS.DATE_OF_INJURY;
            matches.matchedFields.push('dateOfInjury');
            matches.details.dateOfInjury = claim.date;
            matches.confidence.dateOfInjury = 1;
        }
    }

    // Employer Name Matching
    if (documentEntities.potentialEmployerNames?.length > 0 && claim.employerName) {
        const normalizedEmployerName = normalizeString(claim.employerName);
        const bestEmployerMatch = Math.max(...documentEntities.potentialEmployerNames.map(
            docEmployer => JaroWinklerDistance(normalizeString(docEmployer), normalizedEmployerName)
        ));

        if (bestEmployerMatch > 0.85) {
            totalScore += SCORE_WEIGHTS.EMPLOYER_NAME * bestEmployerMatch;
            matches.matchedFields.push('employerName');
            matches.details.employerName = claim.employerName;
            matches.confidence.employerName = bestEmployerMatch;
        }
    }

    // Injury Description Matching
    if (documentEntities.potentialInjuryDescriptions?.length > 0 && claim.injuryDescription) {
        const docInjuryDesc = normalizeString(documentEntities.potentialInjuryDescriptions.join(' '));
        const claimInjuryDesc = normalizeString(claim.injuryDescription);

        const tfidf = calculateTFIDF([docInjuryDesc, claimInjuryDesc]);
        const similarity = calculateCosineSimilarity(tfidf, 0, 1);

        if (similarity > 0.8) {
            totalScore += SCORE_WEIGHTS.INJURY_DESCRIPTION * similarity;
            matches.matchedFields.push('injuryDescription');
            matches.details.injuryDescription = claim.injuryDescription;
            matches.confidence.injuryDescription = similarity;
        }
    }

    // Calculate final score
    const TOTAL_POSSIBLE_SCORE = Object.values(SCORE_WEIGHTS).reduce((a, b) => a + b, 0);
    const percentageScore = (totalScore / TOTAL_POSSIBLE_SCORE) * 100;

    return {
        score: Math.round(percentageScore * 100) / 100, // Round to 2 decimal places
        matches,
        isRecommended: percentageScore >= 75,
        claim: {
            id: claim._id,
            claimNumber: claim.claimnumber,
            name: claim.name,
            date: claim.date,
            adjuster: claim.adjuster,
            employerName: claim.employerName,
            injuryDescription: claim.injuryDescription,
            physicianName: claim.physicianName
        }
    };
};

// Helper function for cosine similarity calculation
const calculateCosineSimilarity = (tfidf, doc1Index, doc2Index) => {
    const terms = new Set();
    [doc1Index, doc2Index].forEach(docIndex => {
        tfidf.listTerms(docIndex).forEach(item => terms.add(item.term));
    });

    const vector1 = Array.from(terms).map(term => tfidf.tfidf(term, doc1Index));
    const vector2 = Array.from(terms).map(term => tfidf.tfidf(term, doc2Index));

    return natural.CosineSimilarity(vector1, vector2);
};

export const findMatchingClaims = async (documentEntities) => {
    try {
        // Use the correct endpoint from your routes
        const response = await fetch('http://localhost:4000/list');
        const allClaims = await response.json();
        
        console.log('Retrieved claims for matching:', allClaims.length); // Debug log
        
        const matchResults = allClaims
            .map(claim => {
                const score = calculateDocumentMatchScore(documentEntities, claim);
                console.log(`Score for claim ${claim.claimNumber}:`, score); // Debug log
                return score;
            })
            .filter(result => result && result.isRecommended)
            .sort((a, b) => b.score - a.score);

        console.log('Filtered match results:', matchResults.length); // Debug log
        return matchResults;
    } catch (error) {
        console.error('Error finding matching claims:', error);
        throw error;
    }
}; 