import { app } from "../firebase/firebase-config.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const formDiv = document.getElementById("submission-form");
const viewDiv = document.getElementById("submission-view");

let currentDocId = null;

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  // USER DATA

  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (userSnap.exists()) {

    const userData = userSnap.data();

    // navbar greeting
    document.getElementById("greeting").innerText =
      "Hi, " + (userData.name || "User");

    // profile section
    document.getElementById("user-email").value =
      userData.email || "";

    document.getElementById("user-institution").value =
      userData.institution || "";

    // ADD AUTHOR NAME FIELD IF EXISTS
    const nameField = document.getElementById("author-name");

    if (nameField) {
      nameField.value = userData.name || "";
    }

  }

  // CHECK SUBMISSION

  const q = query(
    collection(db, "submissions"),
    where("uid", "==", user.uid)
  );

  const snapshot = await getDocs(q);

  if (!snapshot.empty) {

    const docItem = snapshot.docs[0];

    currentDocId = docItem.id;

    showSubmission(docItem.id, docItem.data());

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

  const now = new Date();

  const docRef = await addDoc(collection(db, "submissions"), {

    uid: user.uid,
    email: user.email,

    title: title,
    abstract: abstract,
    paperLink: link,

    status: "pending",

    createdAt: now,
    updatedAt: now

  });

  showSubmission(docRef.id, {

    title: title,
    abstract: abstract,
    paperLink: link,

    status: "pending",

    createdAt: now,
    updatedAt: now

  });

});


// UPDATE SUBMISSION

document.getElementById("update-paper").addEventListener("click", async () => {

  const title = document.getElementById("edit-title").value;
  const abstract = document.getElementById("edit-abstract").value;
  const link = document.getElementById("edit-link").value;

  await updateDoc(doc(db, "submissions", currentDocId), {

    title: title,
    abstract: abstract,
    paperLink: link,

    updatedAt: new Date()

  });

  alert("Submission updated");

  location.reload();

});


// SHOW SUBMISSION

function showSubmission(id, data) {

  formDiv.style.display = "none";
  viewDiv.style.display = "block";

  // TABLE DATA

  document.getElementById("sub-id").innerText = id;

  document.getElementById("sub-title").innerText =
    data.title || "--";

  document.getElementById("created-at").innerText =
    formatDate(data.createdAt);

  document.getElementById("updated-at").innerText =
    formatDate(data.updatedAt);

  // STATUS

  const statusEl = document.getElementById("status-text");

  statusEl.innerText = data.status || "pending";

  statusEl.classList.remove("pending", "accepted", "rejected");

  statusEl.classList.add(data.status || "pending");

  // TOP CARDS

  document.getElementById("top-status").innerText =
    capitalize(data.status || "pending");

  document.getElementById("top-id").innerText =
    id.substring(0, 6);

  document.getElementById("top-updated").innerText =
    formatDate(data.updatedAt);


  // EDIT ENABLED ONLY IF PENDING

  if (data.status === "pending") {

    document.getElementById("edit-section").style.display = "block";

    document.getElementById("edit-title").value =
      data.title || "";

    document.getElementById("edit-abstract").value =
      data.abstract || "";

    document.getElementById("edit-link").value =
      data.paperLink || "";

  }

}


// HELPERS

function formatDate(dateObj) {

  if (!dateObj) return "--";

  if (dateObj.toDate) {
    return dateObj.toDate().toLocaleString();
  }

  return new Date(dateObj).toLocaleString();

}

function capitalize(text) {

  if (!text) return "";

  return text.charAt(0).toUpperCase() + text.slice(1);

}
