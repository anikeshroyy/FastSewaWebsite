// Handles all service form submissions with authentication
const BOOKING_CONFIG = {
    // API_URL: 'http://127.0.0.1:5000/api/bookings',
    API_URL: 'https://fastsewawebsite-1.onrender.com/api/bookings', // Use this for production
};

// Service category mapping based on HTML file names
const SERVICE_CATEGORIES = {
    'newconstruction.html': 'construction',
    'finance.html': 'finance',
    'land.html': 'land',
    'legal.html': 'legal',
    'gst.html': 'gst',
    'incometax.html': 'incometax',
    'material.html': 'material',
    'medical.html': 'medical',
    'repair.html': 'repair',
    'security.html': 'security',
    'trademark.html': 'trademark'
};

/**
 * Get the current service category based on the page
 */
function getCurrentCategory() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    return SERVICE_CATEGORIES[filename] || 'unknown';
}

/**
 * Save form data for post-login restoration
 */
function savePendingBooking(category, formData) {
    const redirectTo = window.location.pathname;
    localStorage.setItem('pending_booking', JSON.stringify({
        category,
        redirectTo,
        formData
    }));
}

/**
 * Restore form data after login
 */
function restorePendingBooking() {
    const pending = localStorage.getItem('pending_booking');
    if (!pending) return false;

    try {
        const { category, formData } = JSON.parse(pending);
        const currentCategory = getCurrentCategory();

        if (category !== currentCategory) return false;

        // Fill form fields
        Object.keys(formData).forEach(key => {
            const field = document.getElementById(key);
            if (field) {
                field.value = formData[key] || '';
            }
        });

        return true;
    } catch (error) {
        console.error('Error restoring form:', error);
        return false;
    }
}

/**
 * Extract form data from a form element
 */
function extractFormData(form) {
    const formData = {};
    const inputs = form.querySelectorAll('input, select, textarea');

    inputs.forEach(input => {
        if (!input.id) return;

        if (input.type === "checkbox") {
            formData[input.id] = input.checked;
        } else {
            formData[input.id] = input.value.trim();
        }
    });

    return formData;
}


/**
 * Submit booking to backend
 */
async function submitBooking(formData, category) {
    const token = localStorage.getItem('fastsewa_token');

    if (!token) {
        throw new Error('Authentication required');
    }

    const payload = {
    ...formData,
    serviceType: formData.serviceType || formData.goalType || null,
    category
};

    const response = await fetch(BOOKING_CONFIG.API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Booking submission failed');
    }

    return data;
}

/**
 * Handle form submission
 */
async function handleFormSubmit(event, formId, buttonId) {
    event.preventDefault();

    const form = document.getElementById(formId);
    const button = document.getElementById(buttonId);
    const category = getCurrentCategory();

    if (!form) {
        console.error(`Form with ID "${formId}" not found`);
        return;
    }

    // Extract form data
    const formData = extractFormData(form);

    // Check authentication
    if (!window.fastsewaAuth.isLoggedIn()) {
        savePendingBooking(category, formData);

        const confirmLogin = confirm("You need to login to continue. Go to login page?");

        if (confirmLogin) {
            window.location.href = '/login.html';
        }

        return;
    }


    // Disable button and show loading state
    const originalText = button.innerHTML;
    button.disabled = true;
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

    try {
        const result = await submitBooking(formData, category);

        // Success
        showToast(result.message || 'Booking submitted successfully!', 'success');

        // Clear pending booking
        localStorage.removeItem('pending_booking');

        // Reset form
        form.reset();

        // Optional: Redirect to dashboard after 2 seconds
        const confirmRedirect = confirm("Booking successful! Go to dashboard now?");

        if (confirmRedirect) {
            const user = JSON.parse(localStorage.getItem('fastsewa_current_user'));
            if (user?.userType === 'admin') {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/dashboard.html';
            }
        }


    } catch (error) {
        console.error('Booking error:', error);
        showToast(error.message || 'Submission failed. Please try again.', 'error');
    } finally {
        // Re-enable button
        button.disabled = false;
        button.innerHTML = originalText;
    }
}

/**
 * Initialize booking handler for a specific form
 */
function initBookingForm(formId, buttonId) {
    const form = document.getElementById(formId);

    if (!form) {
        console.warn(`Form "${formId}" not found on this page`);
        return;
    }

    form.addEventListener('submit', (e) => handleFormSubmit(e, formId, buttonId));

    // Restore pending booking if exists
    restorePendingBooking();
}

/**
 * Auto-initialize common form IDs on page load
 */
document.addEventListener('DOMContentLoaded', function () {
    // Map of form IDs to submit button IDs
    const formConfigs = {
        'constForm': 'submitBtn',
        'financeForm': 'financeSubmit',
        'landForm': 'submitBtn',
        'legalForm': 'submitBtn',
        'gstForm': 'submitBtn',
        'itrForm': 'submitBtn',
        'materialForm': 'submitBtn',
        'medicalForm': 'submitBtn',
        'repairForm': 'submitBtn',
        'securityForm': 'submitBtn',
        'tmForm': 'submitBtn'
    };

    // Initialize all forms that exist on the page
    Object.keys(formConfigs).forEach(formId => {
        const buttonId = formConfigs[formId];
        initBookingForm(formId, buttonId);
    });

    // Special handlers for forms with custom submit functions
    initCustomHandlers();
});

/**
 * Handle medical form booking
 */
async function handleMedicalBooking() {
    const form = document.getElementById('medicalForm');
    const btn = document.querySelector('.btn-submit');
    const status = document.getElementById('bookingStatus');

    if (!form) return;

    // Basic Validation
    const phone = document.getElementById('phone').value;
    const fullName = document.getElementById('fullName').value;
    const bookDate = document.getElementById('bookDate').value;
    const deptSelect = document.getElementById('deptSelect').value;

    if (!phone || !fullName || !bookDate || !deptSelect) {
        alert("Please fill in all required fields (Name, Phone, Date, and Service).");
        return;
    }

    // Extract all form data
    const formData = extractFormData(form);
    formData.serviceType = document.getElementById('deptSelect').value;
    formData.timeSlot = document.getElementById('timeSlot').value;


    // Check authentication
    if (!window.fastsewaAuth.isLoggedIn()) {
        savePendingBooking('medical', formData);
        showToast('Please login to continue', 'info');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
        return;
    }

    // UI Loading State
    const originalBtnText = btn.innerHTML;
    btn.innerHTML = "<i class='fas fa-circle-notch fa-spin'></i> Securing Token...";
    btn.style.opacity = "0.7";
    btn.disabled = true;

    try {
        const result = await submitBooking(formData, 'medical');

        // Success State
        btn.innerHTML = "<i class='fas fa-check-circle'></i> Request Confirmed";
        btn.classList.add('confirmed');
        btn.style.opacity = "1";
        if (status) {
            status.style.color = "var(--primary)";
            status.innerHTML = "Booking confirmed! Redirecting to dashboard...";
        }

        showToast('Medical appointment booked successfully!', 'success');
        localStorage.removeItem('pending_booking');

        // Reset form and redirect
        setTimeout(() => {
            form.reset();
            const user = JSON.parse(localStorage.getItem('fastsewa_current_user'));
            if (user?.userType === 'admin') {
                window.location.href = '/admin/dashboard.html';
            } else {
                window.location.href = '/dashboard.html';
            }
        }, 2000);

    } catch (error) {
        console.error("Booking Error:", error);
        btn.innerHTML = "<i class='fas fa-paper-plane'></i> Try Again";
        btn.style.opacity = "1";
        btn.disabled = false;
        if (status) {
            status.style.color = "#ef4444";
            status.innerHTML = "Connection Error. Please try again.";
        }
        showToast(error.message || 'Booking failed. Please try again.', 'error');
    }
}

/**
 * Handle repair form booking
 */
async function handleRepairBooking() {
    const form = document.getElementById('repairForm');
    const btn = document.querySelector('.btn-confirm');

    if (!form) return;

    // Map repair form fields to booking schema
    const formData = {
        fullName: document.getElementById('fullName').value,
        phone: document.getElementById('phone').value,
        bookDate: document.getElementById('date').value,
        serviceType: document.getElementById('finalService').value,
        message: document.getElementById('message').value,
        notes: document.getElementById('urgentCheck')?.checked ? "URGENT REQUEST" : "Standard Request"
    };

    // Basic Validation
    if (!formData.fullName || !formData.phone || !formData.bookDate) {
        alert("Please fill in your Name, Phone, and Preferred Date.");
        return;
    }

    // Check authentication
    if (!window.fastsewaAuth.isLoggedIn()) {
        savePendingBooking('repair', formData);
        showToast('Please login to continue', 'info');
        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1000);
        return;
    }

    // UI Loading
    btn.innerText = "Sending Request...";
    btn.disabled = true;

    try {
        await submitBooking(formData, 'repair');

        btn.innerText = "Booking Confirmed";
        btn.style.background = "#10b981";

        const isUrgent = document.getElementById('urgentCheck')?.checked;
        const timeStr = isUrgent ? "WITHIN 60 MINS" : "scheduled time";
        const msg = document.getElementById('successMsg');
        if (msg) {
            msg.innerHTML = `<i class="fas fa-check-circle"></i> Request saved! Technician arriving at ${timeStr}.`;
        }

        showToast('Repair booking confirmed!', 'success');
        localStorage.removeItem('pending_booking');

        setTimeout(() => {
            form.reset();
            window.location.href = '/dashboard.html';
        }, 2000);

    } catch (error) {
        console.error('Error:', error);
        btn.innerText = "Error - Try Again";
        btn.disabled = false;
        btn.style.background = "#ef4444";
        showToast(error.message || 'Booking failed. Please try again.', 'error');
    }
}

/**
 * Initialize custom handlers for special cases
 */
function initCustomHandlers() {
    // Medical form - override bookAppointment function
    const medicalForm = document.getElementById('medicalForm');
    if (medicalForm) {
        // Replace the global bookAppointment function
        window.bookAppointment = handleMedicalBooking;
    }

    // Repair form - override confirmBooking function
    const repairForm = document.getElementById('repairForm');
    if (repairForm) {
        // Replace the global confirmBooking function
        window.confirmBooking = handleRepairBooking;
    }
}

// Export for global use
window.FastSewaBooking = {
    submitBooking,
    handleFormSubmit,
    initBookingForm,
    getCurrentCategory,
    restorePendingBooking
};