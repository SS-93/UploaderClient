class ClaimIndexer {
    constructor() {
        this.claimIndex = new Map();
        this.lastUpdated = null;
    }

    async initialize() {
        try {
            const response = await fetch('http://localhost:4000/claims');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const claims = await response.json();
            this.indexClaims(claims);
            this.lastUpdated = new Date();
            console.log('ClaimIndexer initialized successfully');
        } catch (error) {
            console.error('Error initializing ClaimIndexer:', error);
            throw error; // Propagate error for handling by caller
        }
    }

    indexClaims(claims) {
        if (!Array.isArray(claims)) {
            console.error('Expected array of claims for indexing');
            return;
        }

        this.claimIndex.clear(); // Clear existing index before re-indexing
        
        claims.forEach(claim => {
            if (!claim._id) {
                console.warn('Claim missing _id, skipping:', claim);
                return;
            }

            this.claimIndex.set(claim._id, {
                _id: claim._id,
                claimNumber: claim.claimnumber,
                name: claim.name,
                dateOfInjury: claim.date,
                adjuster: claim.adjuster,
                employerName: claim.employerName || '',
                injuryDescription: claim.injuryDescription || '',
                physicianName: claim.physicianName || '',
                documents: claim.documents || []
            });
        });

        console.log(`Claims indexed: ${this.claimIndex.size}`);
        return this.claimIndex;
    }

    getIndexedClaim(claimId) {
        if (!claimId) {
            console.warn('getIndexedClaim called without claimId');
            return null;
        }
        return this.claimIndex.get(claimId);
    }

    getAllIndexedClaims() {
        return Array.from(this.claimIndex.values());
    }

    addOrUpdateClaim(claim) {
        if (!claim || !claim._id) {
            console.error('Invalid claim object provided for indexing');
            return;
        }

        this.claimIndex.set(claim._id, {
            _id: claim._id,
            claimNumber: claim.claimnumber,
            name: claim.name,
            dateOfInjury: claim.date,
            adjuster: claim.adjuster,
            employerName: claim.employerName || '',
            injuryDescription: claim.injuryDescription || '',
            physicianName: claim.physicianName || '',
            documents: claim.documents || []
        });

        console.log(`Claim ${claim._id} indexed/updated`);
    }

    removeClaim(claimId) {
        if (!claimId) {
            console.warn('removeClaim called without claimId');
            return;
        }

        const removed = this.claimIndex.delete(claimId);
        if (removed) {
            console.log(`Claim ${claimId} removed from index`);
        } else {
            console.warn(`Claim ${claimId} not found in index`);
        }
    }

    // Utility method to check if index needs refresh
    needsRefresh(refreshInterval = 3600000) { // Default 1 hour
        if (!this.lastUpdated) return true;
        return (new Date() - this.lastUpdated) > refreshInterval;
    }

    // Method to get index stats
    getIndexStats() {
        return {
            totalClaims: this.claimIndex.size,
            lastUpdated: this.lastUpdated,
            memoryUsage: process.memoryUsage().heapUsed
        };
    }
}

// Create and export singleton instance
export const claimIndexer = new ClaimIndexer();

// Initialize the indexer
claimIndexer.initialize().catch(error => {
    console.error('Failed to initialize ClaimIndexer:', error);
});

export default claimIndexer;