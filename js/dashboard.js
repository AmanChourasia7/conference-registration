import { app } from "../firebase/firebase-config.js";

import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

import {
  getAuth,
  signOut
} from "https://www.gstatic.com/firebasejs/12.10.0/firebase-auth.js";

const db = getFirestore(app);
const auth = getAuth(app);

const table = document.getElementById("registration-table");
const logoutBtn = document.getElementById("logout-btn");

async function loadRegistrations() {

  const querySnapshot = await getDocs(collection(db, "registrations"));

  querySnapshot.forEach((doc) => {

    const data = doc.data();

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.name}</td>
      <td>${data.email}</td>
      <td>${data.institution}</td>
    `;

    table.appendChild(row);

  });

}

logoutBtn.addEventListener("click", async () => {

  await signOut(auth);

  window.location.href = "login.html";

});

loadRegistrations();
