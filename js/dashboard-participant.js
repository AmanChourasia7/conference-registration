import { app } from "../firebase/firebase-config.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUserData = null;
let currentUser = null;


// AUTH

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  try {

    const userRef = doc(db, "users", user.uid);

    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const data = userSnap.data();

      currentUserData = data;

      document.getElementById("greeting").innerText =
        "Hi, " + (data.name || "User");

      document.getElementById("user-name").value =
        data.name || "";

      document.getElementById("user-email").value =
        data.email || "";

      document.getElementById("user-institution").value =
        data.institution || "";

    }

    // CHECK EXISTING PASS
    const passRef =
      doc(db, "gatepasses", user.uid);

    const passSnap =
      await getDoc(passRef);

    if (passSnap.exists()) {

      const passData =
        passSnap.data();

      loadPass(passData);

    }

  }
  catch(err) {

    console.error(err);

  }

});


// LOGOUT

const logoutBtn =
  document.getElementById("logout-btn");

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

  });

}


// GENERATE PASS

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

      const qrData = JSON.stringify({

        name: currentUserData?.name || "",

        email: currentUserData?.email || "",

        institution: currentUserData?.institution || "",

        entryId: entryId

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


// LOAD PASS

function loadPass(data) {

  document.getElementById("gatepass-section").style.display =
    "block";

  // REMOVE BUTTON
  const btn =
    document.getElementById("generate-pass");

  if (btn) {
    btn.style.display = "none";
  }

  document.getElementById("entry-id").innerText =
    data.entryId;

  // QR IMAGE
  const qrContainer =
    document.getElementById("qrcode");

  qrContainer.innerHTML = "";

  const qrImage =
    document.createElement("img");

  qrImage.crossOrigin = "anonymous";

  qrImage.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
    encodeURIComponent(data.qrData);

  qrContainer.appendChild(qrImage);

}


// DOWNLOAD PDF

document.getElementById("download-pass").addEventListener("click", async () => {

  try {

    const pass =
      document.getElementById("pass-card");

    // WAIT FOR QR LOAD
    const qrImg =
      document.querySelector("#qrcode img");

    if (qrImg && !qrImg.complete) {

      await new Promise((resolve) => {

        qrImg.onload = resolve;

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

    // LETTER SIZE
    const pdf =
      new jsPDF({

        orientation: "portrait",

        unit: "pt",

        format: "letter"

      });

    const pageWidth = 612;

    const imgWidth = 560;

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

    pdf.save("OML2027_GatePass.pdf");

  }
  catch(err) {

    console.error(err);

    alert("PDF generation failed");

  }

});
