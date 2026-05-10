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
  updateDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

const formDiv =
  document.getElementById("submission-form");

const viewDiv =
  document.getElementById("submission-view");

let currentDocId = null;

let currentUser = null;

let currentUserData = null;


// ================= AUTH =================

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  try {

    // USER DATA
    const userRef =
      doc(db, "users", user.uid);

    const userSnap =
      await getDoc(userRef);

    if (userSnap.exists()) {

      const userData =
        userSnap.data();

      currentUserData =
        userData;

      document.getElementById("greeting").innerText =
        "Hi, " + (userData.name || "User");

      document.getElementById("user-name").value =
        userData.name || "";

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

    const snapshot =
      await getDocs(q);

    if (!snapshot.empty) {

      const docItem =
        snapshot.docs[0];

      currentDocId =
        docItem.id;

      showSubmission(
        docItem.id,
        docItem.data()
      );

    }

    // LOAD GATEPASS
    const passRef =
      doc(db, "gatepasses", user.uid);

    const passSnap =
      await getDoc(passRef);

    if (passSnap.exists()) {

      loadPass(
        passSnap.data()
      );

    }

  }
  catch(err) {

    console.error(err);

  }

});


// ================= SUBMIT =================

const submitBtn =
  document.getElementById("submit-paper");

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

    const user =
      auth.currentUser;

    const now =
      new Date();

    const docRef =
      await addDoc(
        collection(db, "submissions"),
        {

          uid: user.uid,

          email: user.email,

          title: title,

          abstract: abstract,

          paperLink: link,

          status: "pending",

          createdAt: now,

          updatedAt: now

        }
      );

    currentDocId =
      docRef.id;

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

const updateBtn =
  document.getElementById("update-paper");

if (updateBtn) {

  updateBtn.addEventListener("click", async () => {

    if (!currentDocId) return;

    const title =
      document.getElementById("edit-title").value;

    const abstract =
      document.getElementById("edit-abstract").value;

    const link =
      document.getElementById("edit-link").value;

    await updateDoc(
      doc(db, "submissions", currentDocId),
      {

        title: title,

        abstract: abstract,

        paperLink: link,

        updatedAt: new Date()

      }
    );

    alert("Submission updated");

    location.reload();

  });

}


// ================= SHOW SUBMISSION =================

function showSubmission(id, data) {

  formDiv.style.display =
    "none";

  viewDiv.style.display =
    "block";

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
  else {

    document.getElementById("edit-section").style.display =
      "none";

  }

}


// ================= GATE PASS =================

const generateBtn =
  document.getElementById("generate-pass");

if (generateBtn) {

  generateBtn.addEventListener("click", async () => {

    try {

      const entryId =
        "OML-" +
        Math.random()
        .toString(36)
        .substring(2,10)
        .toUpperCase();

      const qrData =
        JSON.stringify({

          name:
            currentUserData?.name || "",

          email:
            currentUserData?.email || "",

          institution:
            currentUserData?.institution || "",

          role:
            "author",

          entryId:
            entryId

        });

      // SAVE PASS
      await setDoc(
        doc(db, "gatepasses", currentUser.uid),
        {

          entryId: entryId,

          qrData: qrData,

          createdAt: new Date()

        }
      );

      loadPass({

        entryId,

        qrData

      });

    }
    catch(err) {

      console.error(err);

      alert("Failed to generate pass");

    }

  });

}


// ================= LOAD PASS =================

function loadPass(data) {

  document.getElementById("gatepass-section").style.display =
    "block";

  // HIDE GENERATE BUTTON
  const btn =
    document.getElementById("generate-pass");

  if (btn) {

    btn.style.display =
      "none";

  }

  document.getElementById("entry-id").innerText =
    data.entryId;

  // QR
  const qrContainer =
    document.getElementById("qrcode");

  qrContainer.innerHTML =
    "";

  const qrImage =
    document.createElement("img");

  qrImage.crossOrigin =
    "anonymous";

  qrImage.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
    encodeURIComponent(data.qrData);

  qrContainer.appendChild(qrImage);

}


// ================= PDF =================

const downloadBtn =
  document.getElementById("download-pass");

if (downloadBtn) {

  downloadBtn.addEventListener("click", async () => {

    try {

      const pass =
        document.getElementById("pass-card");

      // WAIT FOR QR
      const qrImg =
        document.querySelector("#qrcode img");

      if (qrImg && !qrImg.complete) {

        await new Promise((resolve) => {

          qrImg.onload =
            resolve;

        });

      }

      const canvas =
        await html2canvas(pass, {

          useCORS: true,

          scale: 2

        });

      const imgData =
        canvas.toDataURL("image/png");

      const { jsPDF } =
        window.jspdf;

      const pdf =
        new jsPDF({

          orientation: "portrait",

          unit: "pt",

          format: "letter"

        });

      const imgWidth =
        560;

      const ratio =
        canvas.height / canvas.width;

      const imgHeight =
        imgWidth * ratio;

      pdf.addImage(

        imgData,

        "PNG",

        26,

        20,

        imgWidth,

        imgHeight

      );

      pdf.save(
        "OML2027_Author_Pass.pdf"
      );

    }
    catch(err) {

      console.error(err);

      alert("PDF generation failed");

    }

  });

}
