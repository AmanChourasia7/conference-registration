document.addEventListener("DOMContentLoaded", function () {
    const footerHTML = `
        <td id="footer-left">
            &copy; 2027 QML Conference
        </td>
        <td id="footer-right">
           <a href="registration.html">Register</a>
            <a href="login.html">Login</a>
            <a href="report.html">Report!</a>
        </td>
    `;

    const footerRow = document.getElementById("footer-row");
    if (footerRow) {
        footerRow.innerHTML = footerHTML;
    }
});