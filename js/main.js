import { app } from "../firebase/firebase-config.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.10.0/firebase-firestore.js";

const db = getFirestore(app);

// NAVIGATION BAR MOBILE TOGGLE
function toggle() {
	var ele = document.getElementById("toggleText");
	var text = document.getElementById("displayText");

	if (ele && text) {
		if (ele.style.display == "block") {
			ele.style.display = "none";
			text.innerHTML = "<b>show directions</b>";
		} else {
			ele.style.display = "block";
			text.innerHTML = "<b>hide directions</b>";
		}
	}
}

function toggleMenu() {
	document.body.classList.toggle("mobile-menu-open");
}

function toggle2() {
	var ele = document.getElementById("toggleText2");
	var text = document.getElementById("displayText2");

	if (ele && text) {
		if (ele.style.display == "block") {
			ele.style.display = "none";
			text.innerHTML = "<b>show directions</b>";
		} else {
			ele.style.display = "block";
			text.innerHTML = "<b>hide directions</b>";
		}
	}
}

function toggle_plain() {
	var ele = document.getElementById("toggleText");

	if (ele) {
		if (ele.style.display == "block") {
			ele.style.display = "none";
		} else {
			ele.style.display = "block";
		}
	}
}

// RUN AFTER DOM LOAD
document.addEventListener("DOMContentLoaded", async function () {

	// SAFE MENU HANDLING
	const menu = document.getElementById("menu_box");
	const button = document.querySelector(".mobile-menu-toggle");

	if (menu && button) {

		document.addEventListener("click", function (e) {
			if (!menu.contains(e.target) && !button.contains(e.target)) {
				document.body.classList.remove("mobile-menu-open");
			}
		});

		menu.addEventListener("click", function (e) {
			e.stopPropagation();
		});

		button.addEventListener("click", function (e) {
			e.stopPropagation();
		});
	}

	// FIREBASE FETCH
	try {
		const pageName = window.location.pathname.split("/").pop().replace(".html", "") || "index";
		let docName = pageName === "index" ? "home" : pageName;

		const snap = await getDoc(doc(db, "pages", docName));

		console.log("Firestore response:", snap.data());

		if (snap.exists()) {
			const data = snap.data();

			const el = document.getElementById("page-title");
			if (el) {
				el.innerText = data.title;
			} else {
				console.log("Element #page-title not found");
			}

			const contentEl = document.getElementById("home-content");
			if (contentEl && data.content) {
				contentEl.innerHTML = data.content;
			}

		} else {
			console.log("Document pages/" + docName + " not found");
		}

	} catch (err) {
		console.error("Firebase error:", err);
	}

});
