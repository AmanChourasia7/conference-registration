import { app } from "../firebase/firebase-config.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

let currentUserData = null;


// AUTH

onAuthStateChanged(auth, async (user) => {

  if (!user) {
    window.location.href = "login.html";
    return;
  }

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

  }
  catch(err) {
    console.error(err);
  }

});


// LOGOUT

const logoutBtn = document.getElementById("logout-btn");

if (logoutBtn) {

  logoutBtn.addEventListener("click", async () => {

    await signOut(auth);

    window.location.href = "login.html";

  });

}


// GENERATE PASS

document.getElementById("generate-pass").addEventListener("click", async () => {

  document.getElementById("gatepass-section").style.display =
    "block";

  // unique entry id
  const entryId =
    "OML-" + Math.random().toString(36).substring(2,10).toUpperCase();

  document.getElementById("entry-id").innerText =
    entryId;

  // QR DATA
  const qrData = JSON.stringify({
    name: currentUserData.name || "",
    email: currentUserData.email || "",
    institution: currentUserData.institution || "",
    entryId: entryId
  });

  // clear old qr
  document.getElementById("qrcode").innerHTML = "";

  QRCode.toCanvas(qrData, { width: 180 }, function(err, canvas){

    if (!err) {
      document.getElementById("qrcode").appendChild(canvas);
    }

  });

});


// DOWNLOAD PDF

document.getElementById("download-pass").addEventListener("click", async () => {

  const pass =
    document.getElementById("pass-card");

  const canvas =
    await html2canvas(pass);

  const imgData =
    canvas.toDataURL("image/png");

  const { jsPDF } = window.jspdf;

  const pdf =
    new jsPDF();

  pdf.addImage(
    imgData,
    "PNG",
    10,
    10,
    190,
    0
  );

  pdf.save("OML2027_GatePass.pdf");

});
