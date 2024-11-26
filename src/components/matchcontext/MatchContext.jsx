import React, { createContext, useState } from 'react';
import { findMatchingClaims } from '../../utils/matchingLogic';

export const MatchContext = createContext();

export const MatchProvider = ({ children }) => {
    const [matchState, setMatchState] = useState({
        matches: [],
        totalMatches: 0,
        topScore: 0,
        loading: false,
        error: null
    });

    const findMatches = async (documentEntities) => {
        try {
            setMatchState(prev => ({ ...prev, loading: true, error: null }));
            
            const { totalMatches, topScore, matchResults } = await findMatchingClaims(documentEntities);
            
            setMatchState({
                matches: matchResults,
                totalMatches,
                topScore,
                loading: false,
                error: null
            });
        } catch (error) {
            console.error('Match finding error:', error);
            setMatchState(prev => ({
                ...prev,
                loading: false,
                error: error.message,
                matches: [],
                totalMatches: 0,
                topScore: 0
            }));
        }
    };

    return (
        <MatchContext.Provider value={{ ...matchState, findMatches }}>
            {children}
        </MatchContext.Provider>
    );
};