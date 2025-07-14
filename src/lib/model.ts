import { model } from '@/config/firebaseConfig'; // Adjust the import path as needed

export async function generateText(prompt: string): Promise<string | undefined> {
  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log("Generated text:", text);
    return text; // Return the generated text here
  } catch (e: any) {
    console.error("Error generating text:", e);
    // Optionally return undefined or re-throw the error
    return undefined;
  }
}

// Call the function with a prompt
// generateText("Tell me a story about a talking cat.");
