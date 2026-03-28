// NAVIGATION BAR MOBILE TOGGLE
function toggle() {
	var ele = document.getElementById("toggleText");
	var text = document.getElementById("displayText");
	if(ele.style.display == "block") {
    		ele.style.display = "none";
		text.innerHTML = "<b>show directions</b>";
  	}
	else {
		ele.style.display = "block";
		text.innerHTML = "<b>hide directions</b>";
	}
}
function toggleMenu() {
    document.body.classList.toggle("mobile-menu-open");
}
function toggle2() {
	var ele = document.getElementById("toggleText2");
	var text = document.getElementById("displayText2");
	if(ele.style.display == "block") {
    		ele.style.display = "none";
		text.innerHTML = "<b>show directions</b>";
  	}
	else {
		ele.style.display = "block";
		text.innerHTML = "<b>hide directions</b>";
	}
} 

function toggle_plain() {
	var ele = document.getElementById("toggleText");
	if(ele.style.display == "block") {
    		ele.style.display = "none";
  	}
	else {
		ele.style.display = "block";
	}
}// CLOSE MENU WHEN CLICKING OUTSIDE
document.addEventListener("click", function(e) {
    const menu = document.getElementById("menu_box");
    const button = document.querySelector(".mobile-menu-toggle");

    // if click is NOT inside menu AND NOT on button
    if (!menu.contains(e.target) && !button.contains(e.target)) {
        document.body.classList.remove("mobile-menu-open");
    }
});

// PREVENT MENU FROM CLOSING WHEN CLICKING INSIDE
document.getElementById("menu_box").addEventListener("click", function(e) {
    e.stopPropagation();
});

// PREVENT BUTTON CLICK FROM IMMEDIATE CLOSE
document.querySelector(".mobile-menu-toggle").addEventListener("click", function(e) {
    e.stopPropagation();
});