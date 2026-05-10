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
  setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let currentUserData = null;
let currentTalkData = null;


// AUTH

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    window.location.href = "login.html";

    return;

  }

  currentUser = user;

  // USER
  const userSnap =
    await getDoc(
      doc(db, "users", user.uid)
    );

  if (userSnap.exists()) {

    currentUserData =
      userSnap.data();

    document.getElementById("greeting").innerText =
      "Hi, " + currentUserData.name;

    document.getElementById("user-name").value =
      currentUserData.name || "";

    document.getElementById("user-email").value =
      currentUserData.email || "";

    document.getElementById("user-institution").value =
      currentUserData.institution || "";

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

});


// LOGOUT

document.getElementById("logout-btn")
.addEventListener("click", async () => {

  await signOut(auth);

  window.location.href =
    "login.html";

});


// MODAL

function showModal() {

  document.getElementById("modal-overlay").style.display =
    "flex";

}

document.getElementById("close-modal")
.addEventListener("click", () => {

  document.getElementById("modal-overlay").style.display =
    "none";

});


// SUBMIT TALK

document.getElementById("submit-talk")
.addEventListener("click", async () => {

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

    createdAt: new Date()

  };

  const docRef =
    await addDoc(
      collection(db, "speaker_talks"),
      talkData
    );

  currentTalkData =
    talkData;

  showTalk(
    docRef.id,
    talkData
  );

  alert("Talk submitted");

});


// SHOW TALK

function showTalk(id, data) {

  document.getElementById("talk-form").style.display =
    "none";

  document.getElementById("talk-view").style.display =
    "block";

  document.getElementById("talk-id").innerText =
    id;

  document.getElementById("talk-title-view").innerText =
    data.title;

  document.getElementById("talk-date-view").innerText =
    data.date;

  document.getElementById("talk-slot-view").innerText =
    data.slot;

  const statusEl =
    document.getElementById("talk-status");

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

  // PASS DETAILS
  document.getElementById("pass-talk-title").innerText =
    data.title;

  document.getElementById("pass-talk-status").innerText =
    data.status.toUpperCase();

  document.getElementById("pass-talk-date").innerText =
    data.date;

  document.getElementById("pass-talk-slot").innerText =
    data.slot;

}


// PASS

document.getElementById("generate-pass")
.addEventListener("click", async () => {

  // NO TALK SUBMITTED
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

});


// LOAD PASS

function loadPass(data) {

  document.getElementById("gatepass-section").style.display =
    "block";

  document.getElementById("generate-pass").style.display =
    "none";

  document.getElementById("entry-id").innerText =
    data.entryId;

  const qrContainer =
    document.getElementById("qrcode");

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


// PDF

document.getElementById("download-pass")
.addEventListener("click", async () => {

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

});
