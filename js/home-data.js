import { db } from "../firebase/firebase-config.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadTitle() {
  const snap = await getDoc(doc(db, "pages", "home"));

  if (snap.exists()) {
    document.getElementById("page-title").innerText =
      snap.data().title;
  }
}

loadTitle();
