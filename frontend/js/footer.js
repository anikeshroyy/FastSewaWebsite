document.addEventListener("DOMContentLoaded", function () {
    const footerContainer = document.getElementById("fastsewa-footer");

    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="main-footer">
            <div class="footer-container">
                
                <div class="footer-col brand-col">
                    <a href="index.html" class="footer-logo">
                        <img src="images/logo1.png" alt="FastSewa">
                        <span>FastSewa<span class="dot">.</span></span>
                    </a>
                    <p class="brand-desc">
                        Bihar's #1 Super Portal for Construction, Medical, Legal, and Home Services. Verified Professionals, Transparent Pricing.
                    </p>
                    <div class="social-links">
                        <a href="https://facebook.com/fastsewa.20" target="_blank" class="s-link"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://www.instagram.com/fastsewa2020/" target="_blank" class="s-link"><i class="fab fa-instagram"></i></a>
                        <a href="https://www.linkedin.com/in/fastsewa-facilities-2a062b2a2/" target="_blank" class="s-link"><i class="fab fa-linkedin-in"></i></a>
                        <a href="https://wa.me/918275723755" target="_blank" class="s-link"><i class="fab fa-whatsapp"></i></a>
                        <a href="tel:+918275723755" class="s-link"><i class="fas fa-phone-alt"></i></a>
                    </div>
                </div>
 
                <div class="footer-col">
                    <h3 class="col-title">Our Services</h3>
                    <ul class="footer-links">
                        <li><a href="./services/material.html">Material Supply</a></li>
                        <li><a href="./services/security.html">Security Guard</a></li>
                        <li><a href="./services/legal.html">Legal & Corporate</a></li>
                        <li><a href="./services/trademark.html">Trademark & IP</a></li>
                        <li><a href="./services/land.html">Land Verification</a></li>
                        <li><a href="./services/repair.html">Repairs</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h3 class="col-title">Quick Links</h3>
                    <ul class="footer-links">
                        <li><a href="login.html">Login / Signup</a></li>
                        <li><a href="dashboard.html">User Dashboard</a></li>
                        <li><a href="support1.html">Support Center</a></li>
                        <li><a href="team.html">Our Team</a></li>
                        <li><a href="terms.html">Terms & Conditions</a></li>
                    </ul>
                </div>
              
                <div class="footer-col">
                    <h3 class="col-title">Contact Us</h3>
                    <div class="contact-box">
                        <div class="c-item">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>B Hub, Gandhi Maidan, Patna, 800001</span>
                        </div>
                        <div class="c-item">
                            <i class="fas fa-phone-alt"></i>
                            <a href="tel:+918275723755">+91 82757 23755</a>
                        </div>
                        <div class="c-item">
                            <i class="fas fa-envelope"></i>
                            <a href="mailto:fastsewa2020@gmail.com">fastsewa2020@gmail.com</a>
                        </div>
                        <div class="c-item">
                            <i class="fas fa-clock"></i>
                            <span>Mon - Sat: 9:00 AM - 8:00 PM</span>
                        </div>
                    </div>
                </div>
            </div>

            <div class="footer-bottom">
                <div class="bottom-container">
                    <p>&copy; 2026 FastSewa Super Portal. All rights reserved.</p>
                    <p class="dev-credits">Developed by <a href="https://www.anikeshroy.xyz" target="_blank">Anikesh Roy</a> & <a href="#">Amit Kumar Verma</a></p>
                </div>
            </div>
        </footer>
        `;
    }
});