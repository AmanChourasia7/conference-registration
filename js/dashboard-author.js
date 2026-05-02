import { app } from "../firebase/firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const submitBtn = document.getElementById("submit-paper");
const statusText = document.getElementById("status-text");

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  // LOAD EXISTING SUBMISSION
  const q = query(collection(db, "submissions"), where("uid", "==", user.uid));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const data = snapshot.docs[0].data();
    statusText.innerText = "Status: " + data.status;
  }

});

// SUBMIT
submitBtn.addEventListener("click", async () => {

  const link = document.getElementById("paper-link").value;

  if (!link) {
    alert("Enter PDF link");
    return;
  }

  const user = auth.currentUser;

  await addDoc(collection(db, "submissions"), {
    uid: user.uid,
    email: user.email,
    paperLink: link,
    status: "pending",
    createdAt: new Date()
  });

  alert("Submitted");
});
