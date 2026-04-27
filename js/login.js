import { app } from "../firebase/firebase-config.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // VERY IMPORTANT

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      alert("User data not found");
      return;
    }

    const role = userDoc.data().role;

    if (role === "admin") {
      window.location.href = "admin.html";
    } else {
      window.location.href = "dashboard.html";
    }

  } catch (err) {
    console.error(err);
    document.getElementById("error-message").innerText = "Invalid email or password";
  }
});
