// firebase/firestore.js

import { app } from "./firebase-config.js";
import { getFirestore, collection, addDoc, serverTimestamp } 
from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const db = getFirestore(app);

// function to store registration
export async function saveRegistration(data) {
  try {
    const docRef = await addDoc(collection(db, "registrations"), {
      name: data.name,
      email: data.email,
      institution: data.institution,
      createdAt: serverTimestamp()
    });

    console.log("Registration stored with ID:", docRef.id);
    return docRef.id;

  } catch (error) {
    console.error("Error adding registration:", error);
    throw error;
  }
}
