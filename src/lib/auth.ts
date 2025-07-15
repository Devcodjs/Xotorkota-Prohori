import { auth } from '@/config/firebaseConfig'; // Adjust the import path as needed
import { createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { FirebaseError } from "firebase/app"; // Import FirebaseError

export async function signUp(email: string, password: string): Promise<void> {
  try {
    const userCredential: UserCredential = await createUserWithEmailAndPassword(auth, email, password);
    // Signed up
    const user = userCredential.user;
    console.log("User signed up:", user);
  } catch (error: unknown) {
    if (error instanceof FirebaseError) { // Safely check if it's a FirebaseError
      const errorCode: string = error.code;
      const errorMessage: string = error.message;
      console.error("Error signing up:", errorCode, errorMessage);
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
}
