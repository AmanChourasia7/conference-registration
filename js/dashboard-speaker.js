import { app } from "../firebase/firebase-config.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
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

let currentUser = null;
let currentUserData = null;
let currentTalkData = null;
let currentTalkId = null;


// ================= AUTH =================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href =
      "login.html";

    return;

  }

  currentUser = user;

  try {

    // USER DATA
    const userSnap =
      await getDoc(
        doc(db, "users", user.uid)
      );

    if (userSnap.exists()) {

      currentUserData =
        userSnap.data();

      const greeting =
        document.getElementById("greeting");

      if (greeting) {

        greeting.innerText =
          "Hi, " + (currentUserData.name || "User");

      }

      const userName =
        document.getElementById("user-name");

      if (userName) {

        userName.value =
          currentUserData.name || "";

      }

      const userEmail =
        document.getElementById("user-email");

      if (userEmail) {

        userEmail.value =
          currentUserData.email || "";

      }

      const institution =
        document.getElementById("user-institution");

      if (institution) {

        institution.value =
          currentUserData.institution || "";

      }

    }

    // TALK
    const q = query(
      collection(db, "speaker_talks"),
      where("uid", "==", user.uid)
    );

    const snapshot =
      await getDocs(q);

    if (!snapshot.empty) {

      const docItem =
        snapshot.docs[0];

      currentTalkData =
        docItem.data();

      currentTalkId =
        docItem.id;

      showTalk(
        docItem.id,
        docItem.data()
      );

    }

    // PASS
    const passSnap =
      await getDoc(
        doc(db, "gatepasses", user.uid)
      );

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


// ================= LOGOUT =================

const logoutBtn =
  document.getElementById("logout-btn");

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href =
      "login.html";

  });

}


// ================= MODAL =================

function showModal() {

  const modal =
    document.getElementById("modal-overlay");

  if (modal) {

    modal.style.display =
      "flex";

  }

}

const closeModal =
  document.getElementById("close-modal");

if (closeModal) {

  closeModal.addEventListener("click", () => {

    const modal =
      document.getElementById("modal-overlay");

    if (modal) {

      modal.style.display =
        "none";

    }

  });

}


// ================= SUBMIT TALK =================

const submitTalkBtn =
  document.getElementById("submit-talk");

if (submitTalkBtn) {

  submitTalkBtn.addEventListener("click", async () => {

    try {

      const title =
        document.getElementById("talk-title").value;

      const abstract =
        document.getElementById("talk-abstract").value;

      const ppt =
        document.getElementById("ppt-link").value;

      const date =
        document.getElementById("talk-date").value;

      const slot =
        document.getElementById("talk-slot").value;

      if (!title || !abstract || !ppt || !date || !slot) {

        alert("Fill all fields");

        return;

      }

      const talkData = {

        uid: currentUser.uid,

        title: title,

        abstract: abstract,

        pptLink: ppt,

        date: date,

        slot: slot,

        status: "pending",

        createdAt: new Date(),

        updatedAt: new Date()

      };

      const docRef =
        await addDoc(
          collection(db, "speaker_talks"),
          talkData
        );

      currentTalkData =
        talkData;

      currentTalkId =
        docRef.id;

      showTalk(
        docRef.id,
        talkData
      );

      alert("Talk submitted");

    }
    catch(err) {

      console.error(err);

      alert("Submission failed");

    }

  });

}


// ================= UPDATE TALK =================

const updateTalkBtn =
  document.getElementById("update-talk");

if (updateTalkBtn) {

  updateTalkBtn.addEventListener("click", async () => {

    try {

      if (!currentTalkId) return;

      const title =
        document.getElementById("edit-talk-title").value;

      const abstract =
        document.getElementById("edit-talk-abstract").value;

      const ppt =
        document.getElementById("edit-ppt-link").value;

      const date =
        document.getElementById("edit-talk-date").value;

      const slot =
        document.getElementById("edit-talk-slot").value;

      await updateDoc(
        doc(db, "speaker_talks", currentTalkId),
        {

          title: title,

          abstract: abstract,

          pptLink: ppt,

          date: date,

          slot: slot,

          updatedAt: new Date()

        }
      );

      alert("Talk updated");

      location.reload();

    }
    catch(err) {

      console.error(err);

      alert("Update failed");

    }

  });

}


// ================= SHOW TALK =================

function showTalk(id, data) {

  const form =
    document.getElementById("talk-form");

  const view =
    document.getElementById("talk-view");

  if (form) {

    form.style.display =
      "none";

  }

  if (view) {

    view.style.display =
      "block";

  }

  const talkId =
    document.getElementById("talk-id");

  if (talkId) {

    talkId.innerText =
      id;

  }

  const talkTitle =
    document.getElementById("talk-title-view");

  if (talkTitle) {

    talkTitle.innerText =
      data.title;

  }

  const talkDate =
    document.getElementById("talk-date-view");

  if (talkDate) {

    talkDate.innerText =
      data.date;

  }

  const talkSlot =
    document.getElementById("talk-slot-view");

  if (talkSlot) {

    talkSlot.innerText =
      data.slot;

  }

  const statusEl =
    document.getElementById("talk-status");

  if (statusEl) {

    statusEl.innerText =
      data.status;

    statusEl.classList.remove(
      "pending",
      "accepted",
      "rejected"
    );

    statusEl.classList.add(
      data.status
    );

  }

  // PASS DATA

  const passTitle =
    document.getElementById("pass-talk-title");

  if (passTitle) {

    passTitle.innerText =
      data.title;

  }

  const passStatus =
    document.getElementById("pass-talk-status");

  if (passStatus) {

    passStatus.innerText =
      data.status.toUpperCase();

  }

  const passDate =
    document.getElementById("pass-talk-date");

  if (passDate) {

    passDate.innerText =
      data.date;

  }

  const passSlot =
    document.getElementById("pass-talk-slot");

  if (passSlot) {

    passSlot.innerText =
      data.slot;

  }

  // EDIT SECTION

  if (data.status === "pending") {

    const editSection =
      document.getElementById("edit-section");

    if (editSection) {

      editSection.style.display =
        "block";

    }

    const editTitle =
      document.getElementById("edit-talk-title");

    if (editTitle) {

      editTitle.value =
        data.title || "";

    }

    const editAbstract =
      document.getElementById("edit-talk-abstract");

    if (editAbstract) {

      editAbstract.value =
        data.abstract || "";

    }

    const editPpt =
      document.getElementById("edit-ppt-link");

    if (editPpt) {

      editPpt.value =
        data.pptLink || "";

    }

    const editDate =
      document.getElementById("edit-talk-date");

    if (editDate) {

      editDate.value =
        data.date || "";

    }

    const editSlot =
      document.getElementById("edit-talk-slot");

    if (editSlot) {

      editSlot.value =
        data.slot || "";

    }

  }

}


// ================= GENERATE PASS =================

const generateBtn =
  document.getElementById("generate-pass");

if (generateBtn) {

  generateBtn.addEventListener("click", async () => {

    try {

      if (!currentTalkData) {

        showModal();

        return;

      }

      const entryId =
        "SPK-" +
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
            "speaker",

          talk:
            currentTalkData?.title || "",

          status:
            currentTalkData?.status || "",

          entryId:
            entryId

        });

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

      alert("Gate pass generation failed");

    }

  });

}


// ================= LOAD PASS =================

function loadPass(data) {

  const section =
    document.getElementById("gatepass-section");

  if (section) {

    section.style.display =
      "block";

  }

  const btn =
    document.getElementById("generate-pass");

  if (btn) {

    btn.style.display =
      "none";

  }

  const entry =
    document.getElementById("entry-id");

  if (entry) {

    entry.innerText =
      data.entryId;

  }

  const qrContainer =
    document.getElementById("qrcode");

  if (qrContainer) {

    qrContainer.innerHTML =
      "";

    const img =
      document.createElement("img");

    img.crossOrigin =
      "anonymous";

    img.src =
      "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
      encodeURIComponent(data.qrData);

    qrContainer.appendChild(img);

  }

}


// ================= PDF =================

const downloadBtn =
  document.getElementById("download-pass");

if (downloadBtn) {

  downloadBtn.addEventListener("click", async () => {

    try {

      const pass =
        document.getElementById("pass-card");

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

      pdf.addImage(
        imgData,
        "PNG",
        26,
        20,
        560,
        720
      );

      pdf.save(
        "OML2027_SpeakerPass.pdf"
      );

    }
    catch(err) {

      console.error(err);

      alert("PDF generation failed");

    }

  });

}
