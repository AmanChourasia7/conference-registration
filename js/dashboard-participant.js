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

    loadPassHistory();

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

const generateBtn =
  document.getElementById("generate-pass");

if (generateBtn) {

  generateBtn.addEventListener("click", async () => {

    try {

      document.getElementById("gatepass-section").style.display =
        "block";

      const selectedDay =
        document.getElementById("pass-day").value;

      // ONE PASS PER DAY
      const safeEmail =
        currentUserData.email
        .replace(/[^a-zA-Z0-9]/g, "")
        .substring(0,6)
        .toUpperCase();

      const safeDay =
        selectedDay
        .replace(/\s/g, "")
        .substring(0,5)
        .toUpperCase();

      const entryId =
        "OML-" + safeEmail + "-" + safeDay;

      // GENERATED TIME
      const now =
        new Date();

      const generatedTime =
        now.toLocaleString();

      // PASS DATA
      document.getElementById("entry-id").innerText =
        entryId;

      document.getElementById("pass-date").innerText =
        selectedDay;

      document.getElementById("generated-at").innerText =
        generatedTime;

      document.getElementById("pass-validity").innerText =
        selectedDay + " | 06:00 AM to 09:00 PM";

      // QR CONTENT
      const qrData = JSON.stringify({

        name: currentUserData?.name || "",

        email: currentUserData?.email || "",

        institution: currentUserData?.institution || "",

        entryId: entryId,

        validDate: selectedDay,

        generatedAt: generatedTime

      });

      // CLEAR OLD QR
      const qrContainer =
        document.getElementById("qrcode");

      qrContainer.innerHTML = "";

      // QR IMAGE
      const qrImage =
        document.createElement("img");

      qrImage.style.width = "180px";

      qrImage.style.height = "180px";

      qrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
        encodeURIComponent(qrData);

      qrContainer.appendChild(qrImage);

      // SAVE HISTORY
      saveHistory(selectedDay, entryId, generatedTime);

    }
    catch(err) {

      console.error(err);

      alert("Failed to generate pass");

    }

  });

}


// HISTORY

function saveHistory(day, id, time) {

  const history =
    JSON.parse(localStorage.getItem("passHistory")) || [];

  const exists =
    history.find(item => item.day === day);

  if (!exists) {

    history.push({
      day: day,
      id: id,
      time: time
    });

    localStorage.setItem(
      "passHistory",
      JSON.stringify(history)
    );

  }

  loadPassHistory();

}


function loadPassHistory() {

  const body =
    document.getElementById("history-body");

  body.innerHTML = "";

  const history =
    JSON.parse(localStorage.getItem("passHistory")) || [];

  history.forEach(item => {

    const row =
      document.createElement("tr");

    row.innerHTML = `
      <td>${item.day}</td>
      <td>${item.id}</td>
      <td>${item.time}</td>
    `;

    body.appendChild(row);

  });

}


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
    new jsPDF("p", "mm", "a4");

  const pageWidth =
    pdf.internal.pageSize.getWidth();

  const imgWidth =
    pageWidth - 20;

  const imgHeight =
    canvas.height * imgWidth / canvas.width;

  pdf.addImage(
    imgData,
    "PNG",
    10,
    10,
    imgWidth,
    imgHeight
  );

  pdf.save("OML2027_GatePass.pdf");

});
