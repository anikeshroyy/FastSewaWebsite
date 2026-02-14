document.addEventListener('DOMContentLoaded', function () {
    // 4. SCROLL REVEAL ANIMATION
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

    // 5. MOBILE NAVIGATION TOGGLE
// 5. MOBILE NAVIGATION TOGGLE
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('active');

        // 🔥 Hide chatbot when navbar opens
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
    // ======================================================
    // 3. SMOOTH SCROLLING
    // ======================================================
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

    // ======================================================
    // 4. STATS COUNTER ANIMATION
    // ======================================================
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

    // ======================================================
    // 6. PREMIUM APP POPUP LOGIC
    // ======================================================
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

    // ======================================================
    // 7. AUTHENTICATION PERSISTENCE (REAL APP)
    // ======================================================
    const authAction = document.getElementById("auth-action");
    const currentUser = JSON.parse(localStorage.getItem("fastsewa_current_user"));
    const token = localStorage.getItem("fastsewa_token");

    if (authAction) {

        // ❌ NOT LOGGED IN
        if (!currentUser || !token) {
            authAction.innerHTML = `
            <a href="/login.html" class="btn-nav" onclick="saveRedirect()">Login/Signup</a>
        `;
        }

        // ✅ LOGGED IN
        else {
            const firstName = currentUser.firstName || "User";
            const initial = firstName.charAt(0).toUpperCase();

            authAction.innerHTML = `
            <div class="user-nav-profile" style="position: relative; display: inline-block;">
                <div id="profileTrigger" style="display: flex; align-items: center; gap: 10px; cursor: pointer; background: rgba(255,87,34,0.1); padding: 5px 15px 5px 5px; border-radius: 30px; border: 1px solid rgba(255,87,34,0.2);">
                    <div style="width: 35px; height: 35px; background: #ff5722; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold;">
                        ${initial}
                    </div>
                    <span style="font-weight: 600; font-size: 14px; color: #333;">
                        ${firstName}
                    </span>
                    <i class="fas fa-chevron-down" style="font-size: 12px; color: #666;"></i>
                </div>

                <div id="userDropdown" style="display: none; position: absolute; right: 0; top: 50px; background: white; width: 200px; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 12px; padding: 10px; z-index: 1000; border: 1px solid #eee;">
                    <div style="padding: 10px; border-bottom: 1px solid #eee; margin-bottom: 5px;">
                        <p style="font-size: 12px; color: #888;">Signed in as</p>
                        <p style="font-weight: 600; color: #333; overflow: hidden; text-overflow: ellipsis;">
                            ${currentUser.email}
                        </p>
                    </div>
                    <a href="/dashboard.html" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: #333; font-size: 14px;">
                        <i class="fas fa-th-large" style="color: #ff5722;"></i> Dashboard
                    </a>
                    <a href="#" id="logoutBtn" style="display: flex; align-items: center; gap: 10px; padding: 10px; color: #ef4444; font-size: 14px;">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </a>
                </div>
            </div>
        `;

            document.getElementById("profileTrigger").addEventListener("click", toggleDropdown);
            document.getElementById("logoutBtn").addEventListener("click", logoutUser);
        }
    }

    // Global Helper Functions
    function toggleDropdown() {
        const dropdown = document.getElementById("userDropdown");
        if (dropdown) dropdown.style.display = (dropdown.style.display === "none") ? "block" : "none";
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