// js/registration.js

import { saveRegistration } from "../firebase/firestore.js";

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("registration-form");
  if (!form) return; // prevents crash if not on page

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    // collect all fields (aligned with your HTML)
    const data = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      institution: document.getElementById("institution").value.trim(),
      country: document.getElementById("country").value.trim(),
      role: document.getElementById("role").value,
      message: document.getElementById("message").value.trim(),
      createdAt: new Date().toISOString()
    };

    // basic validation (extra safety)
    if (!data.name || !data.email) {
      alert("Please fill required fields.");
      return;
    }

    try {
      const id = await saveRegistration(data);

      alert("Registration successful.\nID: " + id);

      form.reset();

    } catch (error) {
      console.error(error);
      alert("Registration failed. Please try again.");
    }
  });

});