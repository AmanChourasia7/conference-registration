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


// ================= AUTH =================

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  try {

    // USER DATA
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const userData = userSnap.data();

      document.getElementById("greeting").innerText =
        "Hi, " + (userData.name || "User");

      document.getElementById("user-email").value =
        userData.email || "";

      document.getElementById("user-institution").value =
        userData.institution || "";

    }

    // LOAD SUBMISSION
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

  }
  catch(err) {
    console.error(err);
  }

});


// ================= SUBMIT =================

const submitBtn = document.getElementById("submit-paper");

if (submitBtn) {

  submitBtn.addEventListener("click", async () => {

    const title =
      document.getElementById("paper-title").value;

    const abstract =
      document.getElementById("paper-abstract").value;

    const link =
      document.getElementById("paper-link").value;

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

}


// ================= UPDATE =================

const updateBtn = document.getElementById("update-paper");

if (updateBtn) {

  updateBtn.addEventListener("click", async () => {

    if (!currentDocId) return;

    const title =
      document.getElementById("edit-title").value;

    const abstract =
      document.getElementById("edit-abstract").value;

    const link =
      document.getElementById("edit-link").value;

    await updateDoc(doc(db, "submissions", currentDocId), {

      title: title,
      abstract: abstract,
      paperLink: link,

      updatedAt: new Date()

    });

    alert("Submission updated");

    location.reload();

  });

}


// ================= SHOW =================

function showSubmission(id, data) {

  formDiv.style.display = "none";

  viewDiv.style.display = "block";

  document.getElementById("sub-id").innerText =
    id;

  document.getElementById("sub-title").innerText =
    data.title || "";

  const statusEl =
    document.getElementById("status-text");

  statusEl.innerText =
    data.status || "pending";

  statusEl.classList.remove(
    "pending",
    "accepted",
    "rejected"
  );

  statusEl.classList.add(
    data.status || "pending"
  );

  document.getElementById("created-at").innerText =
    data.createdAt?.toDate?.().toLocaleString?.() || "--";

  document.getElementById("updated-at").innerText =
    data.updatedAt?.toDate?.().toLocaleString?.() || "--";

  // ALLOW EDIT ONLY IF PENDING
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
