import { app } from "../firebase/firebase-config.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  deleteDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);


// AUTH

onAuthStateChanged(auth, async (user) => {

  if (!user) {

    document.body.innerHTML =
      "<h2>401 Unauthorized</h2>";

    return;

  }

  const emailEl =
    document.getElementById("admin-email");

  if (emailEl) {

    emailEl.innerText =
      user.email;

  }

  const userDoc =
    await getDoc(
      doc(db, "users", user.uid)
    );

  if (
    !userDoc.exists() ||
    userDoc.data().role !== "admin"
  ) {

    document.body.innerHTML =
      "<h2>403 Forbidden</h2>";

    return;

  }

  loadStats();

});


// LOGOUT

document.getElementById("logout-btn")
.addEventListener("click", async () => {

  await signOut(auth);

  window.location.href =
    "login.html";

});


// PAGE EDITOR

document.getElementById("load-btn")
.addEventListener("click", async () => {

  const page =
    document.getElementById("page-select").value;

  const snap =
    await getDoc(
      doc(db, "pages", page)
    );

  if (snap.exists()) {

    const data =
      snap.data();

    document.getElementById("title-input").value =
      data.title || "";

    document.getElementById("content-input").value =
      data.content || "";

  }

});


document.getElementById("save-btn")
.addEventListener("click", async () => {

  const page =
    document.getElementById("page-select").value;

  await setDoc(
    doc(db, "pages", page),
    {

      title:
        document.getElementById("title-input").value,

      content:
        document.getElementById("content-input").value

    }
  );

  alert("Page updated");

});


// BACKUP

document.getElementById("backup-btn")
.addEventListener("click", async () => {

  const querySnapshot =
    await getDocs(
      collection(db, "pages")
    );

  let backupData = {};

  querySnapshot.forEach((docItem) => {

    backupData[docItem.id] =
      docItem.data();

  });

  const blob =
    new Blob(
      [JSON.stringify(backupData, null, 2)],
      { type: "application/json" }
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "firebase_pages_backup.json";

  a.click();

  URL.revokeObjectURL(url);

});


// STATS

async function loadStats() {

  const users =
    await getDocs(collection(db, "users"));

  const registrations =
    await getDocs(collection(db, "registrations"));

  const gatepasses =
    await getDocs(collection(db, "gatepasses"));

  let organizerCount = 0;

  users.forEach(docItem => {

    if (docItem.data().role === "organizer") {

      organizerCount++;

    }

  });

  document.getElementById("total-users").innerText =
    users.size;

  document.getElementById("total-registrations").innerText =
    registrations.size;

  document.getElementById("total-gatepasses").innerText =
    gatepasses.size;

  document.getElementById("total-organizers").innerText =
    organizerCount;

}


// USERS

document.getElementById("load-users-btn")
.addEventListener("click", async () => {

  const tbody =
    document.getElementById("users-table");

  tbody.innerHTML = "";

  const snapshot =
    await getDocs(
      collection(db, "users")
    );

  snapshot.forEach(docItem => {

    const data =
      docItem.data();

    const uid =
      docItem.id;

    const row =
      document.createElement("tr");

    row.innerHTML = `

      <td>${data.email || ""}</td>

      <td>${data.role || ""}</td>

      <td>${data.blocked ? "Yes" : "No"}</td>

      <td class="table-actions">

        <button onclick="makeAdmin('${uid}')">
          Admin
        </button>

        <button onclick="makeOrganizer('${uid}')">
          Organizer
        </button>

        <button onclick="toggleBlock('${uid}', ${data.blocked ? true : false})">
          ${data.blocked ? "Unblock" : "Block"}
        </button>

        <button onclick="deleteUser('${uid}')">
          Delete
        </button>

      </td>

    `;

    tbody.appendChild(row);

  });

});


// REGISTRATIONS

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


// GATEPASSES

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

      <td class="table-actions">

        <button onclick="revokeGatepass('${docItem.id}')">
          Revoke
        </button>

      </td>

    `;

    tbody.appendChild(row);

  });

});


// USER ACTIONS

window.makeAdmin = async (uid) => {

  await updateDoc(
    doc(db, "users", uid),
    {
      role: "admin"
    }
  );

  alert("Admin assigned");

};


window.makeOrganizer = async (uid) => {

  await updateDoc(
    doc(db, "users", uid),
    {
      role: "organizer"
    }
  );

  alert("Organizer assigned");

};


window.toggleBlock = async (uid, currentStatus) => {

  await updateDoc(
    doc(db, "users", uid),
    {
      blocked: !currentStatus
    }
  );

  alert("User updated");

};


window.deleteUser = async (uid) => {

  if (!confirm("Delete user?"))
    return;

  await deleteDoc(
    doc(db, "users", uid)
  );

  alert("User deleted");

};


window.revokeGatepass = async (uid) => {

  if (!confirm("Revoke gatepass?"))
    return;

  await deleteDoc(
    doc(db, "gatepasses", uid)
  );

  alert("Gatepass revoked");

};


// QR SCANNER

document.getElementById("start-scanner-btn")
.addEventListener("click", async () => {

  const scanner =
    new Html5Qrcode("reader");

  scanner.start(

    { facingMode: "environment" },

    {
      fps: 10,
      qrbox: 250
    },

    async (decodedText) => {

      try {

        const data =
          JSON.parse(decodedText);

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

      }
      catch(err) {

        document.getElementById("scan-result").innerHTML =
          "<div class='revoked'>Invalid QR Code</div>";

      }

    }

  );

});
