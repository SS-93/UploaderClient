export const performNER = async (text, OcrId) => {
    try {
        console.log('Sending NER request:', {
            textLength: text.length,
            OcrId
        });

        const response = await fetch('http://localhost:4000/ai/perform-ner', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text, OcrId }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.details || data.error || 'Failed to perform NER');
        }

        console.log('NER Response:', data);

        return {
            entities: data.entities || {},
            matchResults: data.matchResults || [],
            document: data.document
        };
    } catch (error) {
        console.error('Error performing NER:', {
            message: error.message,
            OcrId
        });
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