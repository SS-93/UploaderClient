import React, { createContext, useState } from 'react';
import { findMatchingClaims } from '../../utils/matchingLogic';
import { transformMatchResults } from '../../utils/matchTransformer';

export const MatchContext = createContext();

export const MatchProvider = ({ children }) => {
    const [matchState, setMatchState] = useState({
        matches: [],
        detailedMatches: [],
        totalMatches: 0,
        topScore: 0,
        loading: false,
        error: null,
        lastUpdated: null,
        matchHistory: []
    });

    const saveMatchHistory = async (OcrId, matchResults) => {
        try {
            console.log('Saving match history:', { OcrId, matchResults }); // Debug log

            const response = await fetch('http://localhost:4000/match-history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    OcrId,
                    matchResults: {
                        matches: matchResults.matches,
                        timestamp: matchResults.timestamp,
                        topScore: matchResults.topScore,
                        recommendedMatches: matchResults.recommendedMatches.map(match => ({
                            score: match.score,
                            matchedFields: match.matchedFields,
                            confidence: match.confidence,
                            matchDetails: match.matchDetails,
                            isRecommended: match.isRecommended,
                            claimId: match.claimId,
                            claimNumber: match.claimNumber
                        }))
                    }
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`Failed to save match history: ${errorData.message}`);
            }
            
            const savedData = await response.json();
            console.log('Match history saved successfully:', savedData); // Debug log
            
            await getMatchHistory(OcrId);
        } catch (error) {
            console.error('Error saving match history:', error);
        }
    };

    const getMatchHistory = async (OcrId) => {
        try {
            const response = await fetch(`http://localhost:4000/ai/match-history/${OcrId}`);
            if (!response.ok) throw new Error('Failed to fetch match history');
            
            const data = await response.json();
            if (!data.matchHistory) {
                throw new Error('Match history data not found');
            }
            
            setMatchState(prev => ({
                ...prev,
                matchHistory: data.matchHistory
            }));
            
            return data.matchHistory;
        } catch (error) {
            console.error('Error fetching match history:', error);
            setMatchState(prev => ({
                ...prev,
                error: error.message
            }));
            return [];
        }
    };

    const findMatches = async (documentEntities) => {
        try {
            setMatchState(prev => ({ ...prev, loading: true }));
            
            // Get basic results for AI Processor
            const basicResults = await findMatchingClaims(documentEntities);
            
            // Transform the results for SuggestedClaims
            const transformedResults = transformMatchResults(basicResults);
            
            // Calculate scores
            const topScore = Math.max(...transformedResults.map(m => m.score || 0), 0);

            // Prepare match history entry
            const matchHistoryEntry = {
                OcrId: documentEntities.OcrId,
                matchResults: {
                    matches: transformedResults,
                    timestamp: new Date().toISOString(),
                    topScore: topScore,
                    recommendedMatches: transformedResults
                        .filter(match => match.score >= 75)  // Consider matches above 75% as recommended
                        .map(match => ({
                            matchedFields: match.matchedFields || [],
                            confidence: {
                                claimNumber: match.confidence?.claimNumber || 0,
                                name: match.confidence?.name || 0,
                                employerName: match.confidence?.employerName || 0,
                                dateOfInjury: match.confidence?.dateOfInjury || 0,
                                physicianName: match.confidence?.physicianName || 0
                            },
                            matchDetails: match.matches?.details || {},
                            isRecommended: true,
                            claimId: match.claimId,
                            claimNumber: match.claimNumber,
                            score: match.score
                        }))
                }
            };

            // Save match history
            if (documentEntities.OcrId) {
                await saveMatchHistory(documentEntities.OcrId, matchHistoryEntry.matchResults);
            }

            setMatchState({
                matches: basicResults,
                detailedMatches: transformedResults,
                totalMatches: transformedResults.length,
                topScore,
                loading: false,
                error: null,
                lastUpdated: new Date().toISOString()
            });

            // Fetch updated match history
            await getMatchHistory(documentEntities.OcrId);

        } catch (error) {
            console.error('Match finding error:', error);
            setMatchState(prev => ({
                ...prev,
                loading: false,
                error: error.message,
                lastUpdated: new Date().toISOString()
            }));
        }
    };

    return (
        <MatchContext.Provider value={{ 
            ...matchState, 
            findMatches,
            getMatchHistory,
            saveMatchHistory 
        }}>
            {children}
        </MatchContext.Provider>
    );
};