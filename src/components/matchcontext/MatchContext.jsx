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

    const findMatches = async (entities) => {
        try {
            setMatchState(prev => ({ ...prev, loading: true, error: null }));
            
            const response = await fetch('http://localhost:4000/ai/process-matches', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ entities })
            });

            if (!response.ok) {
                throw new Error('Failed to process matches');
            }

            const data = await response.json();
            
            const matchResults = data.matchResults || [];
            
            setMatchState(prev => ({
                ...prev,
                matches: matchResults,
                detailedMatches: matchResults,
                totalMatches: data.totalMatches || 0,
                topScore: data.topScore || 0,
                loading: false,
                lastUpdated: new Date().toISOString()
            }));

        } catch (error) {
            console.error('Match finding error:', error);
            setMatchState(prev => ({
                ...prev,
                loading: false,
                error: error.message,
                matches: [],
                detailedMatches: []
            }));
        }
    };

    const getMatchHistory = async (OcrId) => {
        try {
            console.log('Starting getMatchHistory for OcrId:', OcrId);
            setMatchState(prev => ({ ...prev, loading: true, error: null }));
            
            const response = await fetch(`http://localhost:4000/ai/suggested-claims/${OcrId}`);
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Error response:', errorData);
                throw new Error(errorData.details || errorData.error || 'Failed to fetch match history');
            }
            
            const data = await response.json();
            console.log('Match history data received:', data);
            
            if (!data.matchResults) {
                console.warn('No match results in response');
                return setMatchState(prev => ({
                    ...prev,
                    loading: false,
                    matchHistory: [],
                    detailedMatches: []
                }));
            }

            const transformedMatches = transformMatchResults(data.matchResults);
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

    const normalizeDate = (dateStr) => {
        if (!dateStr) return '';
        
        // Remove any non-numeric characters and get an array of numbers
        const numbers = dateStr.split(/\D+/).filter(n => n);
        
        // If we have at least 3 numbers (month, day, year), try to format
        if (numbers.length >= 3) {
            const month = numbers[0].padStart(2, '0');
            const day = numbers[1].padStart(2, '0');
            const year = numbers[2].length === 2 ? `20${numbers[2]}` : numbers[2];
            return `${month}${day}${year}`;
        }
        
        // If date parsing fails, return the original string normalized
        return dateStr.toLowerCase().replace(/[^a-z0-9]/g, '');
    };
    

    const processBatch = async (documents, minScore = 75) => {
        try {
            setMatchState(prev => ({ ...prev, loading: true, error: null }));
            
            const response = await fetch('http://localhost:4000/ai/auto-sort-batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ documents, minScore })
            });

            if (!response.ok) throw new Error('Failed to process batch');
            
            const data = await response.json();
            return data.results;

        } catch (error) {
            console.error('Batch processing error:', error);
            setMatchState(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
            throw error;
        } finally {
            setMatchState(prev => ({ ...prev, loading: false }));
        }
    };

    return (
        <MatchContext.Provider value={{ 
            ...matchState, 
            findMatches,
            getMatchHistory,
            processBatch
        }}>
            {children}
        </MatchContext.Provider>
    );
};