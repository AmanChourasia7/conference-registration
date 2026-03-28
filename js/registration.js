// js/registration.js

import { saveRegistration } from "../firebase/firestore.js";

const form = document.getElementById("registration-form");

form.addEventListener("submit", async function (event) {
  event.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const institution = document.getElementById("institution").value;

  const data = {
    name: name,
    email: email,
    institution: institution
  };

  try {
    const id = await saveRegistration(data);

    alert("Registration successful. ID: " + id);

    form.reset();

  } catch (error) {
    alert("Registration failed. Try again.");
    console.error(error);
  }
});
