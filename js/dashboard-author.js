import { app } from "../firebase/firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const statusText = document.getElementById("status-text");

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  // LOAD USER DETAILS
  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (userSnap.exists()) {
    const data = userSnap.data();

    document.getElementById("user-email").innerText = data.email || "";
    document.getElementById("user-institution").innerText = data.institution || "";
    document.getElementById("greeting").innerText = "Hi, " + (data.name || "User");
  }

  // LOAD SUBMISSION STATUS
  const q = query(collection(db, "submissions"), where("uid", "==", user.uid));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const data = snapshot.docs[0].data();
    statusText.innerText = "Status: " + data.status;
  }

});


// SUBMIT PAPER
document.getElementById("submit-paper").addEventListener("click", async () => {

  const title = document.getElementById("paper-title").value;
  const abstract = document.getElementById("paper-abstract").value;
  const link = document.getElementById("paper-link").value;

  if (!title || !abstract || !link) {
    alert("Fill all fields");
    return;
  }

  const user = auth.currentUser;

  await addDoc(collection(db, "submissions"), {
    uid: user.uid,
    email: user.email,
    title: title,
    abstract: abstract,
    paperLink: link,
    status: "pending",
    createdAt: new Date()
  });

  alert("Submitted");
});


// SUPPORT MESSAGE
document.getElementById("send-support").addEventListener("click", async () => {

  const msg = document.getElementById("support-message").value;

  if (!msg) {
    alert("Enter message");
    return;
  }

  const user = auth.currentUser;

  await addDoc(collection(db, "support_requests"), {
    uid: user.uid,
    email: user.email,
    message: msg,
    createdAt: new Date()
  });

  alert("Support request sent");
});
