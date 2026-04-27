import { app } from "../firebase/firebase-config.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

// ADMIN AUTH CHECK
onAuthStateChanged(auth, async (user) => {

  if (!user) {
    // not logged in ----------> show error code
    document.body.innerHTML = "<h2>401 Unauthorized</h2><p>You must login to access this page.</p>";
    return;
  }

  // show email
  const emailEl = document.getElementById("admin-email");
  if (emailEl) {
    emailEl.innerText = user.email;
  }

  // check role
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

const pageSelect = document.getElementById("page-select");
const titleInput = document.getElementById("title-input");
const contentInput = document.getElementById("content-input");

// LOAD
document.getElementById("load-btn").addEventListener("click", async () => {
  const page = pageSelect.value;

  const snap = await getDoc(doc(db, "pages", page));

  if (snap.exists()) {
    const data = snap.data();

    titleInput.value = data.title || "";
    contentInput.value = data.content || "";
  }
});

// SAVE
document.getElementById("save-btn").addEventListener("click", async () => {
  const page = pageSelect.value;

  await setDoc(doc(db, "pages", page), {
    title: titleInput.value,
    content: contentInput.value
  });

  alert("Saved");
});

// BACKUP ALL
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
