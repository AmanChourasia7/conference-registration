import { initializeApp } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyApcPdCFJQ5Fhm3LDsiLm-jN8FvspG13Bw",
  authDomain: "conference-registration-iitp.firebaseapp.com",
  projectId: "conference-registration-iitp",
  storageBucket: "conference-registration-iitp.firebasestorage.app",
  messagingSenderId: "241554962829",
  appId: "1:241554962829:web:c09ea2b590c7484be465c4",
  measurementId: "G-LLF7WVGHDM"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export { app };

