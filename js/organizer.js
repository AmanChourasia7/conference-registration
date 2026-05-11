import { app } from "../firebase/firebase-config.js";

import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

let qrScanner = null;
let scanningLocked = false;


// ================= AUTH =================

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    document.body.innerHTML =
      "<h2>401 Unauthorized</h2>";

    return;

  }

  document.getElementById("organizer-email")
  .innerText = user.email;

  const userDoc =
    await getDoc(
      doc(db, "users", user.uid)
    );

  if (
    !userDoc.exists() ||
    userDoc.data().role !== "organizer"
  ) {

    document.body.innerHTML =
      "<h2>403 Forbidden</h2>";

    return;

  }

  loadStats();
  loadScanHistory();

});


// ================= LOGOUT =================

document.getElementById("logout-btn")
.addEventListener("click", async () => {

  await signOut(auth);

  window.location.href =
    "login.html";

});


// ================= STATS =================

async function loadStats() {

  const registrations =
    await getDocs(
      collection(db, "registrations")
    );

  const submissions =
    await getDocs(
      collection(db, "submissions")
    );

  const gatepasses =
    await getDocs(
      collection(db, "gatepasses")
    );

  document.getElementById("total-registrations").innerText =
    registrations.size;

  document.getElementById("total-submissions").innerText =
    submissions.size;

  document.getElementById("total-gatepasses").innerText =
    gatepasses.size;

}


// ================= SUBMISSIONS =================

document.getElementById("load-submissions-btn")
.addEventListener("click", async () => {

  const tbody =
    document.getElementById("submissions-table");

  tbody.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(db, "submissions")
    );

  snapshot.forEach(docItem => {

    const data =
      docItem.data();

    const row =
      document.createElement("tr");

    row.innerHTML = `

      <td>${data.title || data.talkTitle || ""}</td>

      <td>${data.email || ""}</td>

      <td>${data.status || "pending"}</td>

      <td class="table-actions">

        <button
          class="success"
          onclick="approveSubmission('${docItem.id}')"
        >
          Accept
        </button>

        <button
          class="danger"
          onclick="rejectSubmission('${docItem.id}')"
        >
          Reject
        </button>

      </td>

    `;

    tbody.appendChild(row);

  });

});


// ================= REGISTRATIONS =================

document.getElementById("load-registrations-btn")
.addEventListener("click", async () => {

  const tbody =
    document.getElementById("registrations-table");

  tbody.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(db, "registrations")
    );

  snapshot.forEach(docItem => {

    const data =
      docItem.data();

    const row =
      document.createElement("tr");

    row.innerHTML = `

      <td>${data.name || ""}</td>

      <td>${data.email || ""}</td>

      <td>${data.institution || ""}</td>

      <td>${data.country || ""}</td>

      <td>${data.category || ""}</td>

    `;

    tbody.appendChild(row);

  });

});


// ================= GATEPASSES =================

document.getElementById("load-gatepasses-btn")
.addEventListener("click", async () => {

  const tbody =
    document.getElementById("gatepasses-table");

  tbody.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(db, "gatepasses")
    );

  snapshot.forEach(docItem => {

    const data =
      docItem.data();

    const row =
      document.createElement("tr");

    row.innerHTML = `

      <td>${docItem.id}</td>

      <td>${data.entryId || ""}</td>

    `;

    tbody.appendChild(row);

  });

});


// ================= ACCEPT / REJECT =================

window.approveSubmission = async (id) => {

  await updateDoc(
    doc(db, "submissions", id),
    {
      status: "accepted"
    }
  );

  alert("Submission accepted");

  document.getElementById(
    "load-submissions-btn"
  ).click();

};


window.rejectSubmission = async (id) => {

  await updateDoc(
    doc(db, "submissions", id),
    {
      status: "rejected"
    }
  );

  alert("Submission rejected");

  document.getElementById(
    "load-submissions-btn"
  ).click();

};


// ================= QR SCANNER =================

document.getElementById("start-scanner-btn")
.addEventListener("click", async () => {

  try {

    scanningLocked = false;

    document.getElementById("scan-result").innerHTML =
      "";

    if (qrScanner) {

      try {

        await qrScanner.stop();

      }
      catch(e){}

      try {

        await qrScanner.clear();

      }
      catch(e){}

    }

    qrScanner =
      new Html5Qrcode("reader");

    await qrScanner.start(

      { facingMode: "environment" },

      {
        fps: 10,
        qrbox: 250
      },

      async (decodedText) => {

        if (scanningLocked)
          return;

        scanningLocked = true;

        try {

          const data =
            JSON.parse(decodedText);

          await qrScanner.stop();

          await qrScanner.clear();

          document.getElementById("reader").innerHTML =
            "";

          document.getElementById("scan-result").innerHTML = `

            <div class="verified">

              ✅ VERIFIED GATEPASS

              <br><br>

              Name: ${data.name}<br>
              Email: ${data.email}<br>
              Institution: ${data.institution}<br>
              Entry ID: ${data.entryId}

            </div>

          `;

          alert(
            "Gatepass verified successfully"
          );

          await addDoc(
            collection(db, "scan_history"),
            {

              name:
                data.name || "",

              email:
                data.email || "",

              institution:
                data.institution || "",

              entryId:
                data.entryId || "",

              scannedAt:
                new Date()

            }
          );

          loadScanHistory();

        }
        catch(err) {

          console.error(err);

          document.getElementById("scan-result").innerHTML =
            "<div class='revoked'>Invalid QR Code</div>";

        }

      }

    );

  }
  catch(err) {

    console.error(err);

    alert("Camera start failed");

  }

});


// ================= SCAN HISTORY =================

async function loadScanHistory() {

  const tbody =
    document.getElementById("scan-history-table");

  tbody.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(db, "scan_history")
    );

  snapshot.forEach(docItem => {

    const data =
      docItem.data();

    const row =
      document.createElement("tr");

    row.innerHTML = `

      <td>${data.name || ""}</td>

      <td>${data.email || ""}</td>

      <td>${data.entryId || ""}</td>

      <td>

        ${
          data.scannedAt?.toDate?.()
          ?.toLocaleString?.() || ""
        }

      </td>

    `;

    tbody.appendChild(row);

  });

}
