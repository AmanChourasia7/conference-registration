import { login } from "../firebase/auth-service.js";

const form = document.getElementById("login-form");

form.addEventListener("submit", async function(event) {

  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {

    await login(email, password);

    alert("Login successful");

    window.location.href = "dashboard.html";

  } catch (error) {

    document.getElementById("error-message").innerText =
      "Login failed. Check credentials.";

    console.error(error);

  }

});
