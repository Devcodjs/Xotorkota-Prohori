import { model } from '@/config/firebaseConfig'; // Adjust the import path as needed

export async function generateText(prompt: string): Promise<string | undefined> {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("Generated text:", text);
    return text; // Return the generated text here
  } catch (e: unknown) {
    if (e instanceof Error) {
      console.error("Error generating text:", e.message);
    } else {
      console.error("An unknown error occurred while generating text:", e);
    }
    return undefined;
  }
}
