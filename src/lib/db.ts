import { db } from '@/config/firebaseConfig'; // Adjust the import path as needed
import { collection, addDoc, CollectionReference, DocumentReference } from "firebase/firestore";

async function addDataToFirestore(data: object): Promise<void> {
  try {
    const myCollectionRef: CollectionReference = collection(db, "myCollection");
    const docRef: DocumentReference = await addDoc(myCollectionRef, data);
    console.log("Document written with ID: ", docRef.id);
  } catch (e: any) { // Use 'any' or a more specific type
    console.error("Error adding document: ", e);
  }
}

// Call the function with data
// addDataToFirestore({ name: "John Doe", age: 30 });
