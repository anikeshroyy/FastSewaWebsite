document.addEventListener('DOMContentLoaded', function () {
    // SCROLL REVEAL ANIMATION
    function reveal() {
        var reveals = document.querySelectorAll('.reveal');
        for (var i = 0; i < reveals.length; i++) {
            var windowHeight = window.innerHeight;
            var elementTop = reveals[i].getBoundingClientRect().top;
            var elementVisible = 50;
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    }
    window.addEventListener('scroll', reveal);
    reveal(); // Run on load
    setTimeout(reveal, 500);

    // MOBILE NAVIGATION TOGGLE
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');

    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');

            // Hide chatbot when navbar opens
            if (navLinks.classList.contains('active')) {
                document.body.classList.add('hide-chatbot');
                document.body.style.overflow = "hidden";
            } else {
                document.body.classList.remove('hide-chatbot');
                document.body.style.overflow = "initial";
            }
        });

        document.querySelectorAll('.nav-links li a').forEach(n =>
            n.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('hide-chatbot');
                document.body.style.overflow = "initial";
            })
        );
    }
    // SMOOTH SCROLLING
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // STATS COUNTER ANIMATION
    const statsSection = document.querySelector('.stats-section');
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    if (statsSection && counters.length > 0) {
        const animateCounters = () => {
            counters.forEach(counter => {
                const updateCount = () => {
                    const target = +counter.getAttribute('data-target');
                    const count = +counter.innerText.replace(/,/g, '').replace(/\+/g, '');
                    const inc = target / speed;
                    if (count < target) {
                        counter.innerText = Math.ceil(count + inc);
                        setTimeout(updateCount, 20);
                    } else {
                        counter.innerText = target >= 1000 ? target.toLocaleString() + "+" : target + "+";
                    }
                };
                updateCount();
            });
        };

        const statsObserver = new IntersectionObserver((entries, observer) => {
            const [entry] = entries;
            if (entry.isIntersecting) {
                animateCounters();
                observer.unobserve(statsSection);
            }
        }, { threshold: 0.2 });
        statsObserver.observe(statsSection);
    }

    // PREMIUM APP POPUP LOGIC
    const popup = document.getElementById("fsAppPopup");
    const mini = document.getElementById("fsAppMin");
    const minBtn = document.getElementById("fsMin");
    const closeBtn = document.getElementById("fsClose");

    if (popup) {
        if (!localStorage.getItem("fsPopupClosed")) {
            setTimeout(() => { popup.style.display = "block"; }, 2500);
        } else if (mini) {
            mini.style.display = "flex";
        }

        if (closeBtn) closeBtn.onclick = () => {
            popup.style.display = "none";
            if (mini) mini.style.display = "none";
            localStorage.setItem("fsPopupClosed", "true");
        };

        if (minBtn) minBtn.onclick = () => {
            popup.style.display = "none";
            if (mini) mini.style.display = "flex";
        };

        if (mini) mini.onclick = () => {
            popup.style.display = "block";
            mini.style.display = "none";
        };
    }

    // AUTHENTICATION PERSISTENCE (REAL APP)
    const authAction = document.getElementById("auth-action");
    const currentUser = JSON.parse(localStorage.getItem("fastsewa_current_user"));
    const token = localStorage.getItem("fastsewa_token");

    if (authAction) {

        // NOT LOGGED IN
        if (!currentUser || !token) {
            authAction.innerHTML = `
            <a href="/login.html" class="btn-nav" onclick="saveRedirect()">Login/Signup</a>
        `;
        }

        // LOGGED IN
        else {
            const firstName = currentUser.firstName || "User";
            const initial = firstName.charAt(0).toUpperCase();

            authAction.innerHTML = `
<li class="user-nav-profile">
    <div id="profileTrigger" class="profile-trigger">
        <div class="profile-avatar">${initial}</div>
        <span class="profile-name">${firstName}</span>
        <i class="fas fa-chevron-down"></i>
    </div>

    <div id="userDropdown" class="profile-dropdown">
        <div class="dropdown-header">
            <p>Signed in as</p>
            <strong>${currentUser.email}</strong>
        </div>
        <a href="/dashboard.html" class="dropdown-link">
            <i class="fas fa-th-large"></i> Dashboard
        </a>
        <a href="#" id="logoutBtn" class="dropdown-link logout">
            <i class="fas fa-sign-out-alt"></i> Logout
        </a>
    </div>
</li>
`;

            document.getElementById("profileTrigger").addEventListener("click", toggleDropdown);
            document.getElementById("logoutBtn").addEventListener("click", logoutUser);
        }
    }

    // Global Helper Functions
    function toggleDropdown() {
        const dropdown = document.getElementById("userDropdown");
        dropdown.style.display =
            dropdown.style.display === "block" ? "none" : "block";
    }

    function logoutUser() {
        localStorage.removeItem("fastsewa_token");
        localStorage.removeItem("fastsewa_current_user");
        localStorage.removeItem("auth_redirect");
        localStorage.removeItem("pending_booking");
        window.location.href = "/index.html";
    }


    window.onclick = function (event) {
        if (!event.target.closest('.user-nav-profile')) {
            const dropdown = document.getElementById("userDropdown");
            if (dropdown) dropdown.style.display = "none";
        }
    };
})

function saveRedirect() {
    localStorage.setItem("auth_redirect", window.location.href);
}