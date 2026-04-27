import { app } from "../firebase/firebase-config.js";
import { getFirestore, doc, getDoc, setDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const db = getFirestore(app);

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
