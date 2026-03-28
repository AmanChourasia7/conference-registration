document.addEventListener("DOMContentLoaded", function () {
    const heroHTML = `
    <div class="hero-banner" aria-label="Conference banner">
        <img src="assets/background-slider.png" alt="Conference banner" class="hero-bg-image">

        <div class="hero-overlay">
            <div class="hero-top-row">
                <div class="hero-logo hero-logo-left">
                    
                </div>
                <div class="hero-logo hero-logo-right">
                <button class="mobile-menu-toggle" onclick="toggleMenu()">
                        <span class="hamburger-icon"></span>
                    </button>
                </div>
            </div>

            <div class="hero-main-text">
                1<sup>st</sup> Conference on<br>
                Optimization and Machine Learning
            </div>

            <div class="hero-bottom-right">
                Tutorial: 8 - 9 January 2027, LH001, Indian Institute of Technology Patna<br>
                Scientific Programme: 10 - 14 January 2027, LH004, Indian Institute of Technology Patna
            </div>
        </div>
    </div>
    `;

    const container = document.getElementById("hero-container");
    if (container) {
        container.innerHTML = heroHTML;
    }
});