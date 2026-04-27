import { app } from "../firebase/firebase-config.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

// ADMIN AUTH CHECK
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    document.body.innerHTML = "<h2>401 Unauthorized</h2><p>You must login to access this page.</p>";
    return;
  }

  const emailEl = document.getElementById("admin-email");
  if (emailEl) {
    emailEl.innerText = user.email;
  }

  const userDoc = await getDoc(doc(db, "users", user.uid));

  if (!userDoc.exists() || userDoc.data().role !== "admin") {
    document.body.innerHTML = "<h2>403 Forbidden</h2><p>Access denied. Admins only.</p>";
    return;
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

// PAGE EDIT
const pageSelect = document.getElementById("page-select");
const titleInput = document.getElementById("title-input");
const contentInput = document.getElementById("content-input");

// LOAD PAGE
document.getElementById("load-btn").addEventListener("click", async () => {
  const page = pageSelect.value;

  const snap = await getDoc(doc(db, "pages", page));

  if (snap.exists()) {
    const data = snap.data();
    titleInput.value = data.title || "";
    contentInput.value = data.content || "";
  }
});

// SAVE PAGE
document.getElementById("save-btn").addEventListener("click", async () => {
  const page = pageSelect.value;

  await setDoc(doc(db, "pages", page), {
    title: titleInput.value,
    content: contentInput.value
  });

  alert("Saved");
});

// BACKUP
document.getElementById("backup-btn").addEventListener("click", async () => {

  const querySnapshot = await getDocs(collection(db, "pages"));

  let backupData = {};

  querySnapshot.forEach((docItem) => {
    backupData[docItem.id] = docItem.data();
  });

  const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "firebase_pages_backup.json";
  a.click();

  URL.revokeObjectURL(url);
});


// =========================
// USERS TABLE
// =========================

document.getElementById("load-users-btn").addEventListener("click", async () => {

  const tbody = document.getElementById("users-table");
  tbody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "users"));

  snapshot.forEach(docItem => {
    const data = docItem.data();
    const uid = docItem.id;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.email || ""}</td>
      <td>${data.role || ""}</td>
      <td>${data.blocked ? "Yes" : "No"}</td>
      <td class="table-actions">
        <button onclick="makeAdmin('${uid}')">Admin</button>
        <button onclick="toggleBlock('${uid}', ${data.blocked ? true : false})">
          ${data.blocked ? "Unblock" : "Block"}
        </button>
        <button onclick="deleteUser('${uid}')">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });

});


// =========================
// REGISTRATIONS TABLE
// =========================

document.getElementById("load-registrations-btn").addEventListener("click", async () => {

  const tbody = document.getElementById("registrations-table");
  tbody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "registrations"));

  snapshot.forEach(docItem => {
    const data = docItem.data();

    const row = document.createElement("tr");

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


// =========================
// USER ACTIONS
// =========================

// make admin
window.makeAdmin = async (uid) => {
  await updateDoc(doc(db, "users", uid), {
    role: "admin"
  });
  alert("User promoted to admin");
};

// block/unblock
window.toggleBlock = async (uid, currentStatus) => {
  await updateDoc(doc(db, "users", uid), {
    blocked: !currentStatus
  });
  alert(currentStatus ? "User unblocked" : "User blocked");
};

// delete user
window.deleteUser = async (uid) => {
  if (!confirm("Delete this user?")) return;

  await deleteDoc(doc(db, "users", uid));
  alert("User deleted");
};
