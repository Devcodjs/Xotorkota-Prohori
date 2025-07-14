import { auth } from '@/config/firebaseConfig'; // Adjust the import path as needed
import { createUserWithEmailAndPassword, UserCredential } from "firebase/auth";

async function signUp(email: string, password: string): Promise<void> {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Signed up
    const user = userCredential.user;
    console.log("User signed up:", user);
  } catch (error: any) { // Use 'any' or a more specific type if you have custom error handling
    const errorCode: string = error.code;
    const errorMessage: string = error.message;
    console.error("Error signing up:", errorCode, errorMessage);
  }
}

// Call the function with user input
// signUp("test@example.com", "password123");
