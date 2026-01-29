const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:5000/api',
    // BASE_URL: 'https://fastsewawebsite-production.up.railway.app/api',
    ENDPOINTS: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        GET_ME: '/auth/me',
        UPDATE_PROFILE: '/auth/update',
        CHANGE_PASSWORD: '/auth/change-password',
        SERVICES: '/services',
        DASHBOARD_STATS: '/services/dashboard/stats'
    }
};

class User {
    constructor(data) {
        this.id = data._id || data.id;
        this.firstName = data.firstName;
        this.lastName = data.lastName;
        this.fullName = data.fullName || `${data.firstName} ${data.lastName}`;
        this.email = data.email;
        this.phone = data.phone;
        this.userType = data.userType || 'customer';
        this.profilePic = data.profilePic;
        this.walletBalance = data.walletBalance || 0;
        this.totalServices = data.totalServices || 0;
        this.rating = data.rating || 0;
        this.activeBookings = data.activeBookings || 0;
        this.createdAt = data.createdAt || new Date().toISOString();
    }
}

class FastSewaAuth {
    constructor() {
        this.currentUser = null;
        this.token = localStorage.getItem('fastsewa_token') || null;
        this.init();
    }

    async init() {
        const savedUser = localStorage.getItem('fastsewa_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }


    async apiRequest(endpoint, method = 'GET', data = null) {
        const url = `${API_CONFIG.BASE_URL}${endpoint}`;
        const headers = { 'Content-Type': 'application/json' };
        if (this.token) { headers['Authorization'] = `Bearer ${this.token}`; }

        const config = { method, headers };
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            config.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, config);
            const responseData = await response.json();
            if (!response.ok) {
                if (response.status === 401) { this.clearAuth(); }
                throw new Error(responseData.message || 'API request failed');
            }
            return responseData;
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    saveToken(token) {
        this.token = token;
        localStorage.setItem('fastsewa_token', token);
    }

    clearAuth() {
        this.currentUser = null;
        this.token = null;
        localStorage.removeItem('fastsewa_token');
        localStorage.removeItem('fastsewa_current_user');
    }

    async signup(firstName, lastName, email, phone, password, userType) {
        try {
            const response = await this.apiRequest(API_CONFIG.ENDPOINTS.REGISTER, 'POST', { firstName, lastName, email, phone, password, userType });
            if (response.success) {
                this.saveToken(response.token);
                this.currentUser = new User(response.user);
                localStorage.setItem('fastsewa_current_user', JSON.stringify(this.currentUser));
                return { success: true, user: response.user };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message || 'Registration failed.' };
        }
    }

    async login(email, password) {
        try {
            const response = await this.apiRequest(API_CONFIG.ENDPOINTS.LOGIN, 'POST', { email, password });
            if (response.success) {
                this.saveToken(response.token);
                this.currentUser = new User(response.user);
                localStorage.setItem('fastsewa_current_user', JSON.stringify(this.currentUser));
                return { success: true, user: response.user };
            }
            return { success: false, message: response.message };
        } catch (error) {
            return { success: false, message: error.message || 'Login failed.' };
        }
    }

    async logout() {
        this.clearAuth();
        return { success: true };
    }


    // async getCurrentUser() {
    //     if (!this.token) return null;
    //     try {
    //         const response = await this.apiRequest(API_CONFIG.ENDPOINTS.GET_ME);
    //         if (response.success) {
    //             this.currentUser = new User(response.user);
    //             localStorage.setItem('fastsewa_current_user', JSON.stringify(this.currentUser));
    //             return this.currentUser;
    //         }
    //         this.clearAuth();
    //         return null;
    //     } catch (error) {
    //         this.clearAuth();
    //         return null;
    //     }
    // }

    isLoggedIn() {
        return !!this.token;
    }

}

// --- UTILITY: RESTORE FORM DATA ---
function checkAndFillPendingForm() {
    const savedData = localStorage.getItem('pending_booking');
    if (!savedData || !fastsewaAuth.isLoggedIn()) return;

    const { formData } = JSON.parse(savedData);
    if (!formData) return;

    Object.keys(formData).forEach(key => {
        const el = document.getElementById(key);
        if (el) el.value = formData[key];
    });
}


async function performLogout() {
    try { await fastsewaAuth.logout(); }
    finally { window.location.replace('/index.html'); }
}

const fastsewaAuth = new FastSewaAuth();

// --- LOGIN PAGE HANDLER ---
function initLogin() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', async function (e) {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value.trim();
        const loginBtn = document.getElementById('loginBtn');

        try {
            loginBtn.disabled = true;
            const result = await fastsewaAuth.login(email, password);

            if (result.success) {
                showToast('Login successful!', 'success');

                setTimeout(() => {
                    const pending = localStorage.getItem("pending_booking");
                    const forcedRedirect = localStorage.getItem("auth_redirect");

                    if (pending) {
                        const { redirectTo } = JSON.parse(pending);
                        window.location.href = redirectTo.startsWith("/")
                            ? redirectTo
                            : "/" + redirectTo;

                    } else if (forcedRedirect) {
                        localStorage.removeItem("auth_redirect");
                        window.location.href = forcedRedirect;

                    } else {
                        window.location.href = "/index.html";
                    }
                }, 500);
            }

        } catch (error) {
            showToast('Network error.', 'error');
            loginBtn.disabled = false;
        }
    });
}

// Global Toast function
function showToast(message, type = "success") {
    let toast = document.getElementById("fastsewa-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "fastsewa-toast";
        document.body.appendChild(toast);
    }

    toast.className = `fs-toast fs-${type}`;
    toast.innerHTML = `
        <div class="fs-toast-icon">
            ${type === "success" ? "✔" : type === "error" ? "✖" : "ℹ"}
        </div>
        <div class="fs-toast-message">${message}</div>
    `;

    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(20px)";
    }, 3000);
}


// --- INITIALIZATION ON LOAD ---
document.addEventListener('DOMContentLoaded', function () {
    // 1. Check if we need to fill the form
    checkAndFillPendingForm();
    // 2. Initialize page specific logic
    if (window.location.pathname.includes('login.html')) {
        initLogin();
    }

    // 3. Global Logout listeners
    document.addEventListener('click', function (e) {
        const logoutLink = e.target.closest('#logoutBtn, #sidebarLogoutBtn');
        if (logoutLink) {
            e.preventDefault();
            performLogout();
        }
    });
});

window.fastsewaAuth = fastsewaAuth;