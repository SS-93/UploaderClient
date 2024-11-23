export const performNER = async (text, OcrId) => {
    try {
        const response = await fetch('http://localhost:4000/ai/perform-ner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, OcrId }),
        });

        if (!response.ok) {
            throw new Error('Failed to perform NER');
        }

        const data = await response.json();
        return {
            entities: data.entities || data,
            matchResults: data.matchResults || [],
            document: data.document
        };
    } catch (error) {
        console.error('Error performing NER:', error);
        throw error;
    }
};

export const saveUpdatedEntities = async (OcrId, updatedEntities) => {
    try {
        const response = await fetch('http://localhost:4000/ai/save-entities', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ OcrId, updatedEntities }),
        });

        if (!response.ok) {
            throw new Error('Failed to save entities');
        }

        return await response.json();
    } catch (error) {
        console.error('Error saving entities:', error);
        throw error;
    }
};