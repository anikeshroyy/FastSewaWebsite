// const API = "http://localhost:5000/api";
const API = "https://fastsewawebsite.onrender.com/api";

// Get token from localStorage
function getToken() {
    return localStorage.getItem("fastsewa_token");
}

// Auth headers for API requests
function authHeaders() {
    return {
        "Authorization": "Bearer " + getToken(),
        "Content-Type": "application/json"
    };
}

// Category labels mapping
const CATEGORY_LABELS = {
    construction: "Construction",
    land: "Land Services",
    finance: "Finance",
    legal: "Legal",
    medical: "Medical",
    gst: "GST",
    incometax: "Income Tax",
    material: "Material Supply",
    repair: "Repair Service",
    security: "Security",
    trademark: "Trademark"
};

// Status labels mapping
const STATUS_LABELS = {
    pending: "Request Received",
    verified: "Verified",
    assigned: "Professional Assigned",
    completed: "Completed",
    cancelled: "Cancelled"
};

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener("DOMContentLoaded", async () => {
    // Check if user is logged in and is admin
    await checkAdminAuth();

    // Load all data
    loadDashboardStats();
    updateTime();
    setInterval(updateTime, 1000);
});

// ========================================
// AUTH CHECK
// ========================================
async function checkAdminAuth() {
    const token = localStorage.getItem("fastsewa_token");
    const user = JSON.parse(localStorage.getItem("fastsewa_current_user"));

    if (!token || !user) {
        window.location.href = "/login.html";
        return;
    }

    // Check if user is admin
    if (user.userType !== "admin") {
        alert("Access Denied: Admin privileges required");
        localStorage.removeItem("fastsewa_token");
        localStorage.removeItem("fastsewa_current_user");
        window.location.href = "/login.html";
        return;
    }

    // Populate admin info
    const firstName = user.firstName || "Admin";
    document.getElementById("adminName").innerText = user.fullName || "Admin User";
    document.getElementById("adminAvatar").innerText = firstName.charAt(0);
}

// ========================================
// DASHBOARD STATS
// ========================================
async function loadDashboardStats() {
    try {
        const [usersRes, bookingsRes] = await Promise.all([
            fetch(API + "/admin/users", { headers: authHeaders() }).then(r => r.json()),
            fetch(API + "/admin/bookings", { headers: authHeaders() }).then(r => r.json())
        ]);

        const users = usersRes.users || [];
        const bookings = bookingsRes.bookings || [];


        // Calculate stats
        const customers = users.filter(u => u.userType === "customer");
        const admins = users.filter(u => u.userType === "admin");
        const pending = bookings.filter(b => b.status === "pending");

        // Update dashboard stats
        document.getElementById("totalCustomers").innerText = customers.length;
        document.getElementById("totalAdmins").innerText = admins.length;
        document.getElementById("totalBookings").innerText = bookings.length;
        document.getElementById("pendingBookings").innerText = pending.length;

        // Load recent bookings (last 5)
        loadRecentBookings(bookings.slice(0, 5));

    } catch (err) {
        console.error("Failed to load dashboard stats:", err);
        showToast("Failed to load dashboard data", "error");
    }
}

// ========================================
// BOOKINGS MANAGEMENT
// ========================================
async function loadBookings() {
    try {
        const res = await fetch(API + "/admin/bookings", {
            headers: authHeaders()
        }).then(r => r.json());

        const bookings = res.bookings || [];


        const table = document.getElementById("allBookingsTable");
        table.innerHTML = "";

        if (bookings.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="8" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No bookings found</p>
                    </td>
                </tr>`;
            return;
        }

        bookings.forEach(b => {
            table.innerHTML += `
                <tr>
                    <td data-label="Booking ID">
    <strong>FS-${b._id.slice(-6).toUpperCase()}</strong>
</td>

<td data-label="Customer Name">
    ${b.fullName || "N/A"}
</td>

<td data-label="Email">
    ${b.email || "N/A"}
</td>

<td data-label="Phone">
    ${b.phone || "N/A"}
</td>

<td data-label="Service">
    ${CATEGORY_LABELS[b.category] || b.category}
</td>

<td data-label="Date">
    ${new Date(b.date).toLocaleDateString()}
</td>

<td data-label="Status">
    <select class="status-select" onchange="updateStatus('${b._id}', this.value)">
        ${["pending", "verified", "assigned", "completed", "cancelled"].map(s => `
            <option value="${s}" ${b.status === s ? "selected" : ""}>
                ${STATUS_LABELS[s]}
            </option>
        `).join("")}
    </select>
</td>

<td data-label="Action">
    <button class="btn btn-danger" onclick="deleteBooking('${b._id}')">
        <i class="fas fa-trash"></i>
    </button>
</td>

                </tr>`;
        });

    } catch (err) {
        console.error("Failed to load bookings:", err);
        showToast("Failed to load bookings", "error");
    }
}

function loadRecentBookings(bookings) {
    const table = document.getElementById("recentBookingsTable");
    table.innerHTML = "";

    if (bookings.length === 0) {
        table.innerHTML = `
            <tr>
                <td colspan="5" class="empty-state">No recent bookings</td>
            </tr>`;
        return;
    }

    bookings.forEach(b => {
        table.innerHTML += `
            <tr>
                <td data-label="Booking ID">
    <strong>FS-${b._id.slice(-6).toUpperCase()}</strong>
</td>

<td data-label="Customer">
    ${b.fullName || "N/A"}
</td>

<td data-label="Service">
    ${CATEGORY_LABELS[b.category] || b.category}
</td>

<td data-label="Date">
    ${new Date(b.date).toLocaleDateString()}
</td>

<td data-label="Status">
    <span class="status-badge status-${b.status}">
        ${STATUS_LABELS[b.status]}
    </span>
</td>

            </tr>`;
    });
}

async function updateStatus(bookingId, newStatus) {
    try {
        await fetch(API + "/admin/bookings/" + bookingId, {
            method: "PUT",
            headers: authHeaders(),
            body: JSON.stringify({ status: newStatus })
        });

        showToast("Status updated successfully", "success");
        loadBookings();
        loadDashboardStats();

    } catch (err) {
        console.error("Failed to update status:", err);
        showToast("Failed to update status", "error");
    }
}

async function deleteBooking(bookingId) {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
        await fetch(API + "/admin/bookings/" + bookingId, {
            method: "DELETE",
            headers: authHeaders()
        });

        showToast("Booking deleted successfully", "success");
        loadBookings();
        loadDashboardStats();

    } catch (err) {
        console.error("Failed to delete booking:", err);
        showToast("Failed to delete booking", "error");
    }
}

// ========================================
// USERS MANAGEMENT
// ========================================
async function loadUsers() {
    try {
        const res = await fetch(API + "/admin/users", {
            headers: authHeaders()
        }).then(r => r.json());

        const users = res.users || [];
        const customers = users.filter(u => u.userType === "customer");
        const table = document.getElementById("usersTable");
        table.innerHTML = "";

        if (customers.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-users"></i>
                        <p>No customers found</p>
                    </td>
                </tr>`;
            return;
        }

        customers.forEach(u => {
            table.innerHTML += `
                    <tr>
    <td data-label="Name">
        ${u.fullName || u.firstName + " " + u.lastName}
    </td>

    <td data-label="Email">
        ${u.email}
    </td>

    <td data-label="Phone">
        ${u.phone || "N/A"}
    </td>

    <td data-label="Joined">
        ${new Date(u.date).toLocaleDateString()}
    </td>

    <td data-label="Action">

                        <button class="btn btn-danger" onclick="deleteUser('${u._id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                </tr>`;
        });

    } catch (err) {
        console.error("Failed to load users:", err);
        showToast("Failed to load users", "error");
    }
}

async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
        const res = await fetch(API + "/admin/users/" + userId, {
            method: "DELETE",
            headers: authHeaders()
        });

        const data = await res.json();

        if (!res.ok) {
            showToast(data.message || "Delete failed", "error");
            return;
        }

        showToast(data.message || "User deleted successfully", "success");
        loadUsers();
        loadDashboardStats();

    } catch (err) {
        console.error("Failed to delete user:", err);
        showToast("Failed to delete user", "error");
    }
}

// =======================================
// ADMINS MANAGEMENT
// ========================================
async function loadAdmins() {
    try {
        const res = await fetch(API + "/admin/users", {
            headers: authHeaders()
        }).then(r => r.json());

        const users = res.users || [];
        const admins = users.filter(u => u.userType === "admin");

        const table = document.getElementById("adminsTable");
        table.innerHTML = "";

        if (admins.length === 0) {
            table.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">No admins found</td>
                </tr>`;
            return;
        }

        admins.forEach(u => {
            const currentUser = JSON.parse(localStorage.getItem("fastsewa_current_user"));
            const isSelf = u._id === currentUser.id;

            table.innerHTML += `
                <tr>
                    <td data-label="Name">
    ${u.fullName || u.firstName + " " + u.lastName}
</td>

<td data-label="Email">
    ${u.email}
</td>

<td data-label="Role">
    <span class="admin-badge">ADMIN</span>
</td>

<td data-label="Added On">
    ${new Date(u.date).toLocaleDateString()}
</td>

<td data-label="Action">

                        ${!isSelf ? `
                            <button class="btn btn-danger" onclick="deleteUser('${u._id}')">
                                <i class="fas fa-user-minus"></i> Remove
                            </button>
                        ` : `<span style="color: var(--text-muted);">You</span>`}
                    </td>
                </tr>`;
        });

    } catch (err) {
        console.error("Failed to load admins:", err);
        showToast("Failed to load admins", "error");
    }
}

// ========================================
// ADD USER/ADMIN FORMS
// ========================================
document.getElementById("addUserForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const userData = {
        firstName: document.getElementById("userFirstName").value.trim(),
        lastName: document.getElementById("userLastName").value.trim(),
        email: document.getElementById("userEmail").value.trim(),
        password: document.getElementById("userPassword").value.trim(),
        phone: document.getElementById("userPhone").value.trim(),
        userType: "customer"
    };

    try {
        const res = await fetch(API + "/admin/users", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(userData)
        });

        const data = await res.json();

        if (data.success) {
            showToast("Customer added successfully", "success");
            closeModal("addUserModal");
            document.getElementById("addUserForm").reset();
            loadUsers();
            loadDashboardStats();
        } else {
            showToast(data.message || "Failed to add customer", "error");
        }

    } catch (err) {
        console.error("Failed to add user:", err);
        showToast("Failed to add customer", "error");
    }
});

document.getElementById("addAdminForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const adminData = {
        firstName: document.getElementById("adminFirstName").value.trim(),
        lastName: document.getElementById("adminLastName").value.trim(),
        email: document.getElementById("adminEmail").value.trim(),
        password: document.getElementById("adminPassword").value.trim(),
        userType: "admin"
    };

    try {
        const res = await fetch(API + "/admin/users", {
            method: "POST",
            headers: authHeaders(),
            body: JSON.stringify(adminData)
        });

        const data = await res.json();

        if (data.success) {
            showToast("Admin added successfully", "success");
            closeModal("addAdminModal");
            document.getElementById("addAdminForm").reset();
            loadAdmins();
            loadDashboardStats();
        } else {
            showToast(data.message || "Failed to add admin", "error");
        }

    } catch (err) {
        console.error("Failed to add admin:", err);
        showToast("Failed to add admin", "error");
    }
});

// ========================================
// UI CONTROLS
// ========================================
function showSection(sectionId, element) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec =>
        sec.classList.remove('active')
    );

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Update sidebar active state
    if (element) {
        document.querySelectorAll('.nav-item').forEach(nav =>
            nav.classList.remove('active')
        );
        element.classList.add('active');
    }

    // Update header title
    const titles = {
        dashboard: 'Dashboard Overview',
        bookings: 'Bookings Management',
        users: 'Customer Management',
        admins: 'Admin Management'
    };
    document.querySelector('.header-title').innerText = titles[sectionId] || 'Dashboard';

    // Load data for the section
    if (sectionId === "bookings") loadBookings();
    if (sectionId === "users") loadUsers();
    if (sectionId === "admins") loadAdmins();

    // Close mobile sidebar
    if (window.innerWidth < 900) {
        document.getElementById("sidebar").classList.remove("active");
        document.getElementById("sidebarOverlay").classList.remove("active");
    }
}

function toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("sidebarOverlay");

    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
}


function logout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("fastsewa_token");
        localStorage.removeItem("fastsewa_current_user");
        window.location.href = "/login.html";
    }
}

function openAddUserModal() {
    document.getElementById("addUserModal").classList.add("active");
}

function openAddAdminModal() {
    document.getElementById("addAdminModal").classList.add("active");
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.remove("active");
}

function updateTime() {
    const now = new Date();
    const timeStr = now.toLocaleString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        month: 'short',
        day: 'numeric'
    });
    document.getElementById("currentTime").innerText = timeStr;
}

// ========================================
// TOAST NOTIFICATIONS
// ========================================
function showToast(message, type = "success") {
    let toast = document.getElementById("admin-toast");

    if (!toast) {
        toast = document.createElement("div");
        toast.id = "admin-toast";
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            opacity: 0;
            transform: translateY(-20px);
        `;
        document.body.appendChild(toast);
    }

    const colors = {
        success: "#22c55e",
        error: "#ef4444",
        info: "#3b82f6"
    };

    toast.style.background = colors[type] || colors.info;
    toast.innerText = message;
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(-20px)";
    }, 3000);
}

// Close modals on outside click
window.addEventListener("click", (e) => {
    if (e.target.classList.contains("modal")) {
        e.target.classList.remove("active");
    }
});