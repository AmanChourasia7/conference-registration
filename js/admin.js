import { app } from "../firebase/firebase-config.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const db = getFirestore(app);

const pageSelect = document.getElementById("page-select");
const titleInput = document.getElementById("title-input");
const contentInput = document.getElementById("content-input");

document.getElementById("load-btn").addEventListener("click", async () => {
  const page = pageSelect.value;

  const snap = await getDoc(doc(db, "pages", page));

  if (snap.exists()) {
    const data = snap.data();

    titleInput.value = data.title || "";
    contentInput.value = data.content || "";
  }
});

document.getElementById("save-btn").addEventListener("click", async () => {
  const page = pageSelect.value;

  await setDoc(doc(db, "pages", page), {
    title: titleInput.value,
    content: contentInput.value
  });

  alert("Saved");
});
