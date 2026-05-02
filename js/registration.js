import { app } from "../firebase/firebase-config.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, setDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById("registration-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const institution = document.getElementById("institution").value;
  const country = document.getElementById("country").value;
  const roleInput = document.getElementById("role").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      institution: institution,
      role: roleInput || "participant",
      blocked: false
    });

    await addDoc(collection(db, "registrations"), {
      uid: user.uid,
      name: name,
      email: email,
      institution: institution,
      country: country,
      category: roleInput,
      createdAt: new Date()
    });

    alert("Registration successful");
    window.location.href = "login.html";

  } catch (err) {
    console.error(err);
    alert("Registration failed: " + err.message);
  }
});
