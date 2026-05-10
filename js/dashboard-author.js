import { app } from "../firebase/firebase-config.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

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


// ================= AUTH =================

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  // USER DETAILS
  const userSnap = await getDoc(doc(db, "users", user.uid));

  if (userSnap.exists()) {

    const data = userSnap.data();

    // top greeting
    document.getElementById("greeting").innerText =
      "Hi, " + (data.name || "User");

    // profile section
    const emailInput = document.getElementById("user-email");
    const institutionInput = document.getElementById("user-institution");

    if (emailInput) {
      emailInput.value = data.email || "";
    }

    if (institutionInput) {
      institutionInput.value = data.institution || "";
    }

  }

  // LOAD EXISTING SUBMISSION
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


// ================= SUBMIT =================

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

  currentDocId = docRef.id;

  showSubmission(docRef.id, {

    title: title,
    abstract: abstract,
    paperLink: link,

    status: "pending",

    createdAt: now,
    updatedAt: now

  });

  alert("Paper submitted");

});


// ================= UPDATE =================

document.getElementById("update-paper").addEventListener("click", async () => {

  if (!currentDocId) return;

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


// ================= SHOW SUBMISSION =================

function showSubmission(id, data) {

  // hide form
  formDiv.style.display = "none";

  // show submission
  viewDiv.style.display = "block";

  // table values
  document.getElementById("sub-id").innerText =
    id;

  document.getElementById("sub-title").innerText =
    data.title || "";

  // status
  const statusEl = document.getElementById("status-text");

  statusEl.innerText =
    data.status || "pending";

  // reset classes
  statusEl.classList.remove(
    "pending",
    "accepted",
    "rejected"
  );

  // add status class
  statusEl.classList.add(
    data.status || "pending"
  );

  // dates
  document.getElementById("created-at").innerText =
    data.createdAt?.toDate?.().toLocaleString?.() || "--";

  document.getElementById("updated-at").innerText =
    data.updatedAt?.toDate?.().toLocaleString?.() || "--";

  // top cards
  document.getElementById("top-status").innerText =
    data.status || "pending";

  document.getElementById("top-id").innerText =
    id.substring(0, 6);

  document.getElementById("top-updated").innerText =
    data.updatedAt?.toDate?.().toLocaleDateString?.() || "--";

  // EDIT ONLY IF PENDING
  if (data.status === "pending") {

    document.getElementById("edit-section").style.display =
      "block";

    document.getElementById("edit-title").value =
      data.title || "";

    document.getElementById("edit-abstract").value =
      data.abstract || "";

    document.getElementById("edit-link").value =
      data.paperLink || "";

  }

}
