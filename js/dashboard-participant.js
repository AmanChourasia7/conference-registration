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

    const userRef =
      doc(db, "users", user.uid);

    const userSnap =
      await getDoc(userRef);

    if (userSnap.exists()) {

      const data =
        userSnap.data();

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

    loadHistory();

  }
  catch(err) {
    console.error(err);
  }

});


// LOGOUT

document.getElementById("logout-btn")
.addEventListener("click", async () => {

  await signOut(auth);

  window.location.href = "login.html";

});


// GENERATE PASS

document.getElementById("generate-pass")
.addEventListener("click", () => {

  const selectedDay =
    document.getElementById("pass-day").value;

  let history =
    JSON.parse(localStorage.getItem("passHistory")) || [];

  // ALREADY EXISTS
  const existingPass =
    history.find(item => item.day === selectedDay);

  if (existingPass) {

    renderPass(existingPass);

    alert("Pass already exists for this day.");

    return;
  }

  // NEW PASS
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

  const generatedAt =
    new Date().toLocaleString();

  const passData = {

    day: selectedDay,

    id: entryId,

    generatedAt: generatedAt

  };

  history.push(passData);

  localStorage.setItem(
    "passHistory",
    JSON.stringify(history)
  );

  renderPass(passData);

  loadHistory();

});


// RENDER PASS

function renderPass(data) {

  document.getElementById("gatepass-section").style.display =
    "block";

  document.getElementById("entry-id").innerText =
    data.id;

  document.getElementById("pass-date").innerText =
    data.day;

  document.getElementById("generated-at").innerText =
    data.generatedAt;

  document.getElementById("pass-validity").innerText =
    data.day + " | 06:00 AM to 09:00 PM";

  const qrData = JSON.stringify({

    name: currentUserData?.name || "",

    email: currentUserData?.email || "",

    institution: currentUserData?.institution || "",

    entryId: data.id,

    validDate: data.day,

    generatedAt: data.generatedAt

  });

  const qrContainer =
    document.getElementById("qrcode");

  qrContainer.innerHTML = "";

  const qrImage =
    document.createElement("img");

  qrImage.style.width = "180px";

  qrImage.style.height = "180px";

  qrImage.src =
    "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
    encodeURIComponent(qrData);

  qrContainer.appendChild(qrImage);

}


// HISTORY TABLE

function loadHistory() {

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
      <td>${item.generatedAt}</td>
    `;

    body.appendChild(row);

  });

}


// DELETE PASS

document.getElementById("delete-pass")
.addEventListener("click", () => {

  const selectedDay =
    document.getElementById("pass-day").value;

  let history =
    JSON.parse(localStorage.getItem("passHistory")) || [];

  history =
    history.filter(item => item.day !== selectedDay);

  localStorage.setItem(
    "passHistory",
    JSON.stringify(history)
  );

  document.getElementById("gatepass-section").style.display =
    "none";

  loadHistory();

  alert("Pass deleted. You may regenerate.");

});


// DOWNLOAD PDF

document.getElementById("download-pass")
.addEventListener("click", async () => {

  const pass =
    document.getElementById("pass-card");

  const canvas =
    await html2canvas(pass);

  const imgData =
    canvas.toDataURL("image/png");

  const { jsPDF } =
    window.jspdf;

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
