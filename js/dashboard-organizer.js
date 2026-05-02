import { app } from "../firebase/firebase-config.js";
import { getFirestore, collection, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const db = getFirestore(app);

document.getElementById("load-submissions").addEventListener("click", async () => {

  const tbody = document.getElementById("submissions-table");
  tbody.innerHTML = "";

  const snapshot = await getDocs(collection(db, "submissions"));

  snapshot.forEach(docItem => {
    const data = docItem.data();
    const id = docItem.id;

    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${data.title || ""}</td>
      <td>${data.email || ""}</td>
      <td>${data.status}</td>
      <td>
        <button onclick="updateStatus('${id}', 'accepted')">Accept</button>
        <button onclick="updateStatus('${id}', 'rejected')">Reject</button>
      </td>
    `;

    tbody.appendChild(row);
  });

});

// UPDATE STATUS
window.updateStatus = async (id, status) => {
  await updateDoc(doc(db, "submissions", id), {
    status: status
  });

  alert("Updated to " + status);
};
