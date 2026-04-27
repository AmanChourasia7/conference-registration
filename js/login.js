import { app } from "../firebase/firebase-config.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const auth = getAuth(app);

document.querySelector("button").addEventListener("click", async () => {
  const email = document.querySelector("input[type='email']").value;
  const password = document.querySelector("input[type='password']").value;

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // redirect after login
    window.location.href = "admin.html";

  } catch (err) {
    alert("Login failed");
    console.error(err);
  }
});
