import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: For production, it's better to make API calls from your backend
});

export async function performNER(text) {
  const prompt = `Perform Named Entity Recognition on the following text. Identify and list entities such as PERSON, ORGANIZATION, LOCATION, DATE, and any other relevant categories. Format the output as JSON. Here's the text:\n\n${text}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}