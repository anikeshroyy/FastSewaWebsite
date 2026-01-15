document.addEventListener("DOMContentLoaded", function () {
    const footerContainer = document.getElementById("fastsewa-footer");

    if (footerContainer) {
        footerContainer.innerHTML = `
        <footer class="main-footer">
            <div class="footer-container">
                
                <div class="footer-col">
                    <a href="index.html" style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; text-decoration: none;">
                        <img src="images/logo1.png" alt="FastSewa" style="height: 40px;">
                        <span style="font-size: 1.5rem; font-weight: 800; color: white;">FastSewa<span style="color: #ff5722;">.</span></span>
                    </a>
                    <p style="margin-bottom: 20px; line-height: 1.6;">
                        Bihar's #1 Super Portal for Construction, Medical, Legal, and Home Services. Verified Professionals, Transparent Pricing.
                    </p>
                    <div class="social-icons">
                        <a href="https://facebook.com/fastsewa.20" target="_blank" class="social-icon"><i class="fab fa-facebook-f"></i></a>
                        <a href="https://instagram.com" target="_blank" class="social-icon"><i class="fab fa-instagram"></i></a>
                        <a href="https://linkedin.com/in/fastsewa-facilities" target="_blank" class="social-icon"><i class="fab fa-linkedin-in"></i></a>
                        
                        <a href="https://wa.me/918275723755" target="_blank" class="social-icon" title="Chat on WhatsApp"><i class="fab fa-whatsapp"></i></a>
                        <a href="tel:+918275723755" class="social-icon" title="Call Now"><i class="fas fa-phone-alt"></i></a>
                    </div>
                </div>

                <div class="footer-col">
                    <h3>Our Services</h3>
                    <ul class="footer-links">
                        <li><a href="./services/newconstruction.html"><i class="fas fa-chevron-right"></i> Construction</a></li>
                        <li><a href="./services/material.html"><i class="fas fa-chevron-right"></i> Material Supply</a></li>
                        <li><a href="./services/security.html"><i class="fas fa-chevron-right"></i> Security Guard</a></li>
                        <li><a href="./services/medical.html"><i class="fas fa-chevron-right"></i> Medical Aid</a></li>
                        <li><a href="./services/legal.html"><i class="fas fa-chevron-right"></i> Legal & Corporate</a></li>
                        <li><a href="./services/gst.html"><i class="fas fa-chevron-right"></i> GST Filing</a></li>
                        <li><a href="./services/incometax.html"><i class="fas fa-chevron-right"></i> Income Tax (ITR)</a></li>
                        <li><a href="./services/trademark.html"><i class="fas fa-chevron-right"></i> Trademark & IP</a></li> <li><a href="land.html"><i class="fas fa-chevron-right"></i> Land Verification</a></li>
                        <li><a href="./services/finance.html"><i class="fas fa-chevron-right"></i> Finance & Loans</a></li>
                        <li><a href="./services/repair.html"><i class="fas fa-chevron-right"></i> Repairs</a></li>
                    </ul>
                </div>

                <div class="footer-col">
                    <h3>Contact Us</h3>
                    <div class="contact-list">
                        <p><i class="fas fa-map-marker-alt"></i> B Hub, Gandhi Maidan,<br>Patna, Bihar 800001</p>
                        <p><i class="fas fa-phone-alt"></i> <a href="tel:+918275723755" style="color: inherit; padding:0;">+91 82757 23755</a></p>
                        <p><i class="fas fa-envelope"></i> <a href="mailto:fastsewa2020@gmail.com" style="color: inherit; padding:0;">fastsewa2020@gmail.com</a></p>
                        <p><i class="fas fa-clock"></i> Mon - Sat: 9:00 AM - 8:00 PM</p>
                    </div>
                </div>

                <div class="footer-col">
                    <h3>Live Analytics</h3>
                    <div class="visitor-widget">
                        <div class="stat-row">
                            <span>Total Visitors:</span>
                            <span class="stat-num" style="color: #ff5722;">12,540</span>
                        </div>
                        <div class="stat-row">
                            <span>Repeated Users:</span>
                            <span class="stat-num">3,420</span>
                        </div>
                        <div style="border-top: 1px solid rgba(255,255,255,0.1); margin: 10px 0;"></div>
                        <div class="stat-row" style="margin-bottom: 0;">
                            <span><span class="online-dot"></span> Online Now:</span>
                            <span class="stat-num" style="color: #22c55e;">24</span>
                        </div>
                    </div>
                    
                    <h3 style="margin-top: 25px; font-size: 1rem;">Quick Links</h3>
                    <ul class="footer-links">
                        <li><a href="login.html">Login / Signup</a></li>
                        <li><a href="dashboard.html">User Dashboard</a></li>
                        <li><a href="support1.html">Support Center</a></li> <li><a href="team.html">Our Team</a></li>
                        <li><a href="terms.html">Terms & Conditions</a></li>
                    </ul>
                </div>

            </div>

            <div class="footer-bottom">
                <p>&copy; 2026 FastSewa Super Portal. All rights reserved. | Developed by <a href="https://www.linkedin.com/in/nitish-kumar-762461281/" target="_blank" style="color: #ff5722; text-decoration: none; font-weight: 600;">Team Nitish Kumar</a> and <a href="https://www.linkedin.com/in/vivek-kumar-024765265/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" style="color: #ff5722; text-decoration: none; font-weight: 600;">Team Vivek Kumar</a>.</p>
            </div>
        </footer>

        <a href="https://wa.me/918275723755" class="whatsapp-float" target="_blank" title="Chat on WhatsApp">
            <i class="fab fa-whatsapp"></i>
        </a>
        `;
    }
});
