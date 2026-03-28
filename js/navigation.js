document.addEventListener("DOMContentLoaded", function () {
	var navCell = document.querySelector("td#menu_tbl");
	if (!navCell) {
		return;
	}

	var pageContent = document.querySelector("td#content");
	if (!pageContent) {
		return;
	}

	var toggleButton = document.createElement("button");
	toggleButton.type = "button";
	toggleButton.className = "mobile-menu-toggle";
	toggleButton.setAttribute("aria-expanded", "false");
	toggleButton.innerHTML = '<span class="hamburger-icon" aria-hidden="true"></span><span>Menu</span>';

	pageContent.insertBefore(toggleButton, pageContent.firstChild);
	document.body.classList.add("nav-ready");

	var closeMenu = function () {
		document.body.classList.remove("mobile-menu-open");
		toggleButton.setAttribute("aria-expanded", "false");
	};

	toggleButton.addEventListener("click", function () {
		var isOpen = document.body.classList.toggle("mobile-menu-open");
		toggleButton.setAttribute("aria-expanded", String(isOpen));
	});

	navCell.querySelectorAll("a").forEach(function (link) {
		link.addEventListener("click", closeMenu);
	});

	window.addEventListener("resize", function () {
		if (window.innerWidth > 900) {
			closeMenu();
		}
	});
});

