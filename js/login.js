import { app } from "../firebase/firebase-config.js";
import { getAuth, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const form = document.getElementById("login-form");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const userDoc = await getDoc(doc(db, "users", user.uid));

    if (!userDoc.exists()) {
      alert("User data not found");
      await signOut(auth);
      return;
    }

    const data = userDoc.data();

    // BLOCK CHECK
    if (data.blocked) {
      alert("Your account has been blocked");
      await signOut(auth);
      return;
    }

    const role = data.role;

    // ROLE BASED REDIRECT (correct order)
    if (role === "admin") {
      window.location.href = "admin.html";
    }
    else if (role === "organizer") {
      window.location.href = "dashboard-organizer.html";
    }
    else if (role === "author") {
      window.location.href = "dashboard-author.html";
    }
    else if (role === "speaker") {
      window.location.href = "dashboard-speaker.html";
    }
    else {
      window.location.href = "dashboard-participant.html";
    }

  } catch (err) {
    console.error(err);
    document.getElementById("error-message").innerText = "Invalid email or password";
  }
});
