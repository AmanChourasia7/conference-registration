import { app } from "../firebase/firebase-config.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    document.body.innerHTML = "<h2>401 Unauthorized</h2>";
    return;
  }

  const emailEl = document.getElementById("user-email");
  if (emailEl) emailEl.innerText = user.email;

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists()) {
    document.body.innerHTML = "<h2>User data missing</h2>";
    return;
  }

  const data = userDoc.data();

  // block check
  if (data.blocked) {
    document.body.innerHTML = "<h2>Account Blocked</h2>";
    return;
  }

  // OPTIONAL: enforce correct page
  const currentPage = window.location.pathname;

  if (data.role === "author" && !currentPage.includes("author")) {
    window.location.href = "dashboard-author.html";
  }

  if (data.role === "speaker" && !currentPage.includes("speaker")) {
    window.location.href = "dashboard-speaker.html";
  }

  if (data.role === "participant" && !currentPage.includes("participant")) {
    window.location.href = "dashboard-participant.html";
  }

});

// logout
const logoutBtn = document.getElementById("logout-btn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}
