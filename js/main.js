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
}