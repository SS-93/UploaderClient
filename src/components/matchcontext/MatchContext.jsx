import React, { createContext, useState, useCallback } from 'react';
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

    const transformMatchResults = useCallback((results) => {
        return results.map(result => ({
            score: result.score,
            matches: {
                matchedFields: result.matches?.matchedFields || [],
                details: result.matches?.details || {},
                confidence: result.matches?.confidence || {}
            },
            isRecommended: result.isRecommended || false,
            claim: {
                id: result.claim?.id,
                claimNumber: result.claim?.claimNumber || '',
                name: result.claim?.name || '',
                date: result.claim?.date,
                adjuster: result.claim?.adjuster || ''
            }
        }));
    }, []);

    const findMatches = async (documentEntities) => {
        try {
            setMatchState(prev => ({ ...prev, loading: true }));
            
            // Process entities and find matches
            const response = await fetch('http://localhost:4000/ai/process-matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entities: documentEntities })
            });

            if (!response.ok) throw new Error('Failed to process matches');
            
            const data = await response.json();
            const transformedMatches = transformMatchResults(data.matchResults);
            
            setMatchState(prev => ({
                ...prev,
                matches: data.matchResults,
                detailedMatches: transformedMatches,
                totalMatches: transformedMatches.length,
                topScore: Math.max(...transformedMatches.map(m => m.score), 0),
                loading: false,
                lastUpdated: new Date().toISOString()
            }));

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

    const getMatchHistory = async (OcrId) => {
        try {
            setMatchState(prev => ({ ...prev, loading: true }));
            
            const response = await fetch(`http://localhost:4000/ai/suggested-claims/${OcrId}`);
            if (!response.ok) throw new Error('Failed to fetch match history');
            
            const data = await response.json();
            
            const transformedMatches = transformMatchResults(data.matchResults || []);
            
            setMatchState(prev => ({
                ...prev,
                matchHistory: transformedMatches,
                detailedMatches: transformedMatches,
                loading: false,
                lastUpdated: new Date().toISOString()
            }));

        } catch (error) {
            console.error('Match history error:', error);
            setMatchState(prev => ({
                ...prev,
                loading: false,
                error: error.message,
                matchHistory: [],
                detailedMatches: []
            }));
        }
    };

    return (
        <MatchContext.Provider value={{ 
            ...matchState, 
            findMatches,
            getMatchHistory
        }}>
            {children}
        </MatchContext.Provider>
    );
};