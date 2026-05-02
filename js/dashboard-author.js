import { app } from "../firebase/firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";
import { getFirestore, collection, addDoc, query, where, getDocs, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const formDiv = document.getElementById("submission-form");
const viewDiv = document.getElementById("submission-view");

let currentDocId = null;

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  // USER DETAILS
  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (userSnap.exists()) {
    const data = userSnap.data();

    document.getElementById("user-email").innerText = data.email || "";
    document.getElementById("user-institution").innerText = data.institution || "";
    document.getElementById("greeting").innerText = "Hi, " + (data.name || "User");
  }

  // CHECK SUBMISSION
  const q = query(collection(db, "submissions"), where("uid", "==", user.uid));
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docItem = snapshot.docs[0];
    currentDocId = docItem.id;
    showSubmission(docItem.id, docItem.data());
  }

});


// SUBMIT
document.getElementById("submit-paper").addEventListener("click", async () => {

  const title = document.getElementById("paper-title").value;
  const abstract = document.getElementById("paper-abstract").value;
  const link = document.getElementById("paper-link").value;

  if (!title || !abstract || !link) {
    alert("Fill all fields");
    return;
  }

  const user = auth.currentUser;
  const now = new Date();

  const docRef = await addDoc(collection(db, "submissions"), {
    uid: user.uid,
    email: user.email,
    title,
    abstract,
    paperLink: link,
    status: "pending",
    createdAt: now,
    updatedAt: now
  });

  showSubmission(docRef.id, {
    title,
    abstract,
    paperLink: link,
    status: "pending",
    createdAt: now,
    updatedAt: now
  });

});


// UPDATE
document.getElementById("update-paper").addEventListener("click", async () => {

  const title = document.getElementById("edit-title").value;
  const abstract = document.getElementById("edit-abstract").value;
  const link = document.getElementById("edit-link").value;

  await updateDoc(doc(db, "submissions", currentDocId), {
    title,
    abstract,
    paperLink: link,
    updatedAt: new Date()
  });

  alert("Updated");
  location.reload();

});


// SHOW
function showSubmission(id, data) {

  formDiv.style.display = "none";
  viewDiv.style.display = "block";

  document.getElementById("sub-id").innerText = id;
  document.getElementById("sub-title").innerText = data.title;
  document.getElementById("status-text").innerText = data.status;

  document.getElementById("created-at").innerText =
    data.createdAt?.toDate?.().toLocaleString?.() || data.createdAt;

  document.getElementById("updated-at").innerText =
    data.updatedAt?.toDate?.().toLocaleString?.() || data.updatedAt;

  // ALLOW EDIT ONLY IF PENDING
  if (data.status === "pending") {
    document.getElementById("edit-section").style.display = "block";

    document.getElementById("edit-title").value = data.title;
    document.getElementById("edit-abstract").value = data.abstract;
    document.getElementById("edit-link").value = data.paperLink;
  }

}
