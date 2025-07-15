import { db } from '@/config/firebaseConfig'; // Adjust the import path as needed
import { collection, addDoc, CollectionReference, DocumentReference } from "firebase/firestore";
import { FirebaseError } from "firebase/app"; // Import FirebaseError

export async function addDataToFirestore(data: object): Promise<void> {
  try {
    const myCollectionRef: CollectionReference = collection(db, "myCollection");
    const docRef: DocumentReference = await addDoc(myCollectionRef, data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e: unknown) { // Use 'unknown' for better type safety
    if (e instanceof FirebaseError) { // Safely check if it's a FirebaseError
      console.error("Error adding document:", e.code, e.message);
    } else {
      console.error("Error adding document: ", e);
    }
  }
}
