export async function performNER(text) {
    try {
      const response = await fetch('http://localhost:4000/ai/perform-ner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });
  
      if (!response.ok) {
        throw new Error('Failed to perform NER');
      }
  
      return await response.json();
    } catch (error) {
      console.error('Error performing NER:', error);
      throw error;
    }
  }