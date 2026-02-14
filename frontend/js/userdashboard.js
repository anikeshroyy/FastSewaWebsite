let userBookings = [];
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

const STATUS_LABELS = {
    pending: "Request Received",
    verified: "Verified",
    assigned: "Professional Assigned",
    completed: "Completed",
    cancelled: "Cancelled"
};

// 1. AUTH CHECK (Redirect if not logged in)
document.addEventListener("DOMContentLoaded", async () => {
    await fastsewaAuth.getCurrentUser();

    const token = localStorage.getItem("fastsewa_token");
    const user = JSON.parse(localStorage.getItem("fastsewa_current_user"));

    if (!token || !user) {
        window.location.href = "login.html";
        return;
    }

    // BLOCK ADMINS FROM USER DASHBOARD
    if (user.userType === "admin") {
        window.location.href = "/admin/dashboard.html";
        return;
    }

    // Populate UI
    const firstName = user.firstName || "User";

    document.getElementById("sidebarName").innerText = user.fullName;
    document.getElementById("sidebarAvatar").innerText = firstName.charAt(0);
    document.getElementById("welcomeTitle").innerText =
        `Welcome back, ${firstName}!`;

    document.getElementById("pName").value = user.fullName;
    document.getElementById("pEmail").value = user.email;

    loadMyBookings();
});

// 3. TAB SWITCHING LOGIC
function showSection(sectionId, element) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(sec =>
        sec.classList.remove('active')
    );

    // Show selected section
    document.getElementById(sectionId).classList.add('active');

    // Sidebar active state
    if (element) {
        document.querySelectorAll('.nav-item').forEach(nav =>
            nav.classList.remove('active')
        );
        element.classList.add('active');
    }

    // Mobile sidebar close
    if (window.innerWidth < 900) {
        document.getElementById("sidebar").classList.remove("active");
    }

    // Header title
    const titleMap = {
        dashboard: 'Overview',
        profile: 'My Profile',
        bookings: 'Bookings',
        services: 'Request Service',
        wallet: 'Wallet',
        settings: 'Settings'
    };

    document.querySelector('.header-title').innerText =
        titleMap[sectionId] || 'Dashboard';

    // ✅ LOAD BOOKINGS FROM DB
    if (sectionId === "bookings") {
        loadMyBookings();
    }
}


// 4. MOBILE SIDEBAR TOGGLE
function toggleSidebar() {
    document.getElementById("sidebar").classList.toggle("active");
}

// 5. LOGOUT LOGIC
function logout() {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem("fastsewa_token");
        localStorage.removeItem("fastsewa_current_user");
        window.location.href = "/index.html";
    }
}

async function loadMyBookings() {
    try {
        const res = await fastsewaAuth.apiRequest("/bookings/my");
        userBookings = res.bookings;

        const allTable = document.getElementById("myBookingsTable");
        const recentTable = document.getElementById("recentServicesTable");

        allTable.innerHTML = "";
        recentTable.innerHTML = "";

        if (!res.bookings || res.bookings.length === 0) {
            allTable.innerHTML = `
<tr>
  <td data-label="Status" colspan="6" style="text-align:center;color:#64748b;">
    No bookings yet
  </td>
</tr>`;

            return;
        }

        /* -------------------------
           📌 MY BOOKINGS HISTORY
        -------------------------- */
        res.bookings.forEach(b => {
            allTable.innerHTML += `
<tr>
  <td data-label="Booking ID">
    FS-${b._id.slice(-6).toUpperCase()}
  </td>

  <td data-label="Service">
    ${CATEGORY_LABELS[b.category] || b.category}
  </td>

  <td data-label="Type">
    ${b.serviceType || "-"}
  </td>

  <td data-label="Date">
    ${new Date(b.date).toLocaleDateString()}
  </td>

  <td data-label="Status">
    <span class="status-badge status-${b.status}">
      ${STATUS_LABELS[b.status]}
    </span>
  </td>

  <td data-label="Action">
    <button class="btn-view" onclick="viewBooking('${b._id}')">
      View
    </button>
  </td>
</tr>`;
        });


        /* -------------------------
           📌 RECENT REQUESTS (TOP 3)
        -------------------------- */
        res.bookings.slice(0, 3).forEach(b => {
            recentTable.innerHTML += `
<tr>
  <td data-label="Booking ID">
    FS-${b._id.slice(-6).toUpperCase()}
  </td>

  <td data-label="Service">
    ${CATEGORY_LABELS[b.category]}
  </td>

  <td data-label="Type">
    ${b.serviceType || "-"}
  </td>

  <td data-label="Requested On">
    ${new Date(b.date).toLocaleDateString()}
  </td>

  <td data-label="Status">
    <span class="status-badge status-${b.status}">
      ${STATUS_LABELS[b.status]}
    </span>
  </td>

  <td data-label="Action">
    <button class="btn-view" onclick="viewBooking('${b._id}')">
      View
    </button>
  </td>
</tr>
    `;
        });


        // Dashboard stats
        document.getElementById("activeBookings").innerText =
            res.bookings.filter(b =>
                ["pending", "verified", "assigned"].includes(b.status)
            ).length;

        document.getElementById("totalServices").innerText = res.bookings.length;

    } catch (err) {
        console.error("Load bookings failed:", err);
    }
}

const profileForm = document.getElementById("profileForm");

if (profileForm) {
    profileForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const fullName = document.getElementById("pName").value.trim();
        const phone = document.getElementById("pPhone").value.trim();
        const address = document.getElementById("pAddress").value.trim();

        try {
            const res = await fastsewaAuth.apiRequest(
                "/auth/update",
                "PUT",
                { fullName, phone, address }
            );

            if (res.success) {
                const updatedUser = {
                    ...fastsewaAuth.currentUser,
                    fullName: res.user.fullName,
                    phone: res.user.phone,
                    address: res.user.address
                };

                fastsewaAuth.currentUser = updatedUser;
                localStorage.setItem(
                    "fastsewa_current_user",
                    JSON.stringify(updatedUser)
                );

                alert("Profile updated successfully!");
            }
        } catch (err) {
            alert("Failed to update profile");
        }
    });
}

function viewBooking(bookingId) {
    const booking = userBookings.find(b => b._id === bookingId);
    if (!booking) return;

    document.getElementById("bookingModalContent").innerHTML = `
    <p><strong>Booking ID:</strong> FS-${booking._id.slice(-6).toUpperCase()}</p>
    <p><strong>Service:</strong> ${CATEGORY_LABELS[booking.category]}</p>
    <p><strong>Type:</strong> ${booking.serviceType || "-"}</p>

    <p><strong>Status:</strong>
      <span class="status-badge status-${booking.status}">
        ${STATUS_LABELS[booking.status]}
      </span>
    </p>

    <hr style="margin:15px 0;">

    <p><strong>Name:</strong> ${booking.fullName}</p>
    <p><strong>Email:</strong> ${booking.email}</p>
    <p><strong>Phone:</strong> ${booking.phone}</p>

    <hr style="margin:15px 0;">

    <p><strong>Message:</strong><br>${booking.message || "—"}</p>
    <p><strong>Date:</strong> ${new Date(booking.date).toLocaleString()}</p>
  `;

    document.getElementById("bookingModal").style.display = "block";
}

function closeBookingModal() {
    document.getElementById("bookingModal").style.display = "none";
}

